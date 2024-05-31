# template_jwt_node_postgres

Template project for nodejs, jwt, prisma

Instructions:

1. Please install node ( v16)
2. clone this repo using one of the below options: git clone git@github.com:smagesh2106/template_jwt_node_postgres.git OR git clone https://github.com/smagesh2106/template_jwt_node_postgres.git
3. Checkout to update-er branch
4. Ensure that you have installed postgres v15 or v16 and pgadmin4.
5. In the postgres db, create a user called postgres(by default it should have been created) with password(if user is already created then modify the password) as password
6. create a database called usica_test in postgre
7. create a .env in this directory and paste the below

```
   TOKEN_KEY=asdfaj23oiqwetasaab
   APP_HOST=localhost
   APP_PORT=4001
   AUDIT_LOG_FILE=<path-to-this-directoy>/audit.log
   APP_ADMIN_USER=e0001su
   APP_ADMIN_PASSWORD=$2a$10$zH1MmnEVwv0W1nxG.wWIZOlxetqfAdrgM/NRNDo9Ifz/2X26lDn7S
   APP_EMAIL_USER=<your gmail id>
   APP_EMAIL_PASSWORD=<your gmail id's password>
   DATABASE_URL=postgres://postgres:password@localhost:5432/usica_test
```

9. Run: npx prisma db push
10. Run: pg_restore -d usica_test <path-to-file>/usica_test_dump_11oct.sql
11. update swagger doc , whenever the rest api signature has changed.

```
   a. Generate swagger doc.
   npm run start-gendoc

   b. Run the server
   npm start

   c. open swagger doc in the browser
   http://<host>:<port>/doc
```

12. Query mechanism with common paginator

```
Available 'query params' in the url
  - sort                 eg: <url>?sort=email or <url>?sort=email,status
  - sortOrder            eg: &sortOrder=desc     #by default is 'asc'
  - selectColumns        eg: &selectColumns=col1,col2    # Done NOT work if controller has include query( req.includeQuery)
  - searchOp             eg: 'OR' or 'AND'  #by default 'AND'
  - searchMap            eg:  url encoded map value like '{"colName1":"value", "colName2":"value"}' etc..
  - subquery             eq: for injecting custom queries

eg:
  {
   "status": "DELETED",
   "dateSearch":["created_at", "2023-12-08","2023-12-08"],                          # columnName, from(optional), to(optional)
   "profile" :{"id" :7}
   "designation":{"designation_id":{"in":[1,2,3,4,5]}}
   "subquery":{"OR":[
                      {"profile":"first_name", "contains":"query", "mode":"insensitive"},
                      {"profile":"last_name", "contains":"query", "mode":"insensitive"}
                    ]
               }
  }

  #following dateSearch options are allowed
   "dateSearch":["created_at", "2023-12-08"],
   "dateSearch":["created_at", "", "2023-12-08"],
Note:

    1) 'dateSearch' is a special key used only to search date range.
    2) where query built inside the controller(req.whereQuery), will be appended to the common whereQuery


How to send a custom query from browser?
1) Create a json:
eg:
{
  "dateSearch":["created_at", "2023-12-08","2023-12-08"],
  "name":"Paul"
}

2) Create urlencode string for the whole json and send as a 'searchMap' variable
/?searchMap=<urlencoded string>

3) Other search attributes such as sort, sortOrder can be sent whenever required.
/?searchMap=<urlencoded string>&sort=name&sortOrder=desc


```

13. Update swagger doc , whenever the rest api signature has changed.

```
   a. Generate swagger doc.
   npm run start-gendoc

   b. Run the server
   npm start

   c. open swagger doc in the browser
   http://<host>:<port>/doc
```
