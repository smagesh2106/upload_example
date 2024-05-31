const prisma = require("../lib/prisma").prisma;

const paginator = async (model, req) => {
  try {
    const { limit = 10, skip = 0, searchMap, searchOp, sort, sortOrder, selectColumns } = req.query;

    if (isNaN(limit) || isNaN(skip)) {
      return res.status(400).send("Provide valid values for fields: limit, skip");
    }
    //--- final query object ----
    let searchObj = {};
    //Note: if internal whereQuery ('req.whereQuery') is found then only AND operation with userWhereQuery (searchMap) is allowed.

    //where query from req.query
    let whereQueryArray = [];
    if (searchMap) {
      let parsedData = JSON.parse(searchMap);

      Object.keys(parsedData).forEach((key, index) => {
        let whereQuery = {};
        key = key.trim();
        if (key === "dateSearch") {
          let start_date = "";
          let end_date = "";
          if (parsedData[key][1] && parsedData[key][1].length > 0) {
            start_date = new Date(parsedData[key][1]);
            start_date.setHours(0, 0, 0, 0);
          }

          if (parsedData[key][2] && parsedData[key][2].length > 0) {
            end_date = new Date(parsedData[key][2]);
            end_date.setHours(23, 59, 59, 999);
          }

          if (start_date !== "" && end_date !== "") {
            if (start_date > end_date) {
              throw new Error("start date should be less than end date.");
            }
            whereQuery[parsedData[key][0]] = {
              gte: new Date(start_date),
              lte: new Date(end_date),
            };
          } else if (start_date !== "") {
            whereQuery[parsedData[key][0]] = { gte: start_date };
          } else if (end_date !== "") {
            whereQuery[parsedData[key][0]] = { lte: end_date };
          } else {
            //ignore adding dateSearch to the whereQuery.
          }
        } else if (key === "subquery") {
          whereQueryArray.push(parsedData[key]);
        } else {
          if (typeof parsedData[key] === "object") {
            // we use the object type as is.
            whereQuery[key] = parsedData[key];
          } else if (prisma[model].fields[key].typeName === "String") {
            // string, contains can be applied only to a string type.
            whereQuery[key] = { contains: parsedData[key], mode: "insensitive" };
          } else {
            //object type
            whereQuery[key] = { equals: parsedData[key] };
          }
          //whereQuery[key] = { equals: parsedData[key] };
        }
        whereQueryArray.push(whereQuery);
      });
    }

    //Append internal where query if found.
    if (req.whereQuery) {
      whereQueryArray.push(req.whereQuery);
      //only AND is possible if internal Where query is found.
      searchObj.where = { AND: whereQueryArray };
    } else {
      if (whereQueryArray.length > 0) {
        if (searchOp && searchOp === "OR") {
          searchObj.where = { OR: whereQueryArray };
        } else {
          searchObj.where = { AND: whereQueryArray };
        }
      }
    }

    //console.log(JSON.stringify(searchObj));
    //count the no of entries
    const total = await prisma[model].count(searchObj);

    //sort query
    let sortArr = [];
    if (sort) {
      sort.split(",").map((item) => {
        let obj = {};
        item = item.trim();
        if (sortOrder && sortOrder === "desc") {
          obj[item] = "desc";
        } else {
          obj[item] = "asc";
        }
        sortArr.push(obj);
      });
      searchObj.orderBy = sortArr;
    }

    //limit coloums
    let selectObj = {};
    if (selectColumns) {
      selectColumns.split(",").map((item) => {
        item = item.trim();
        selectObj[item] = true;
      });
      searchObj.select = selectObj;
    }

    // requried for pagination
    searchObj.take = parseInt(limit);
    searchObj.skip = parseInt(skip);

    // ***  prisma limitation both 'select' and 'include' cannot be present at the same time.
    if (req.includeQuery) {
      if (searchObj.select) {
        delete searchObj["select"];
      }
      //Add the custom includeQuery from the controller.
      searchObj.include = req.includeQuery;
    }

    //enable this to see the query in the logs.
    console.log(JSON.stringify(searchObj));
    const data = await prisma[model].findMany(searchObj);
    data.map((d) => {
      try {
        delete d["password"];
        delete d["reset_token"];
        delete d["reset_token_expiry"];
      } catch (error) { }
    });

    const currentPage = total === 0 ? 0 : Math.ceil((parseInt(skip) + 1) / parseInt(limit));
    const totalPages = Math.ceil(total / parseInt(limit));

    return {
      data,
      meta: {
        total,
        currentPage,
        totalPages,
      },
    };
  } catch (error) {
    console.log(`Error listing the model: ${model}, error message: ${error}`);
    throw new Error("Bad request :" + error.message);
  }
};
module.exports = paginator;