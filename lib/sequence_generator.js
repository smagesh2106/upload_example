const prisma = require("./prisma").prisma;

const getCalculatedYear = () => {
  //1st April to 31st March
  let financial_year_end = new Date(Date.UTC(new Date().getFullYear(), 2, 31, 23, 59, 59));
  //Current year
  let current_date = new Date();

  let year_full;
  let year_half;

  let fy = current_date.getFullYear();
  let sy = fy - 2000;

  if (current_date > financial_year_end) {
    year_full = fy.toString() + "-" + (fy + 1).toString();
    year_half = (sy + 1).toString();
  } else {
    year_full = (fy - 1).toString() + "-" + fy.toString();
    year_half = (sy - 1).toString();
  }
  return [year_full, year_half];
};

async function getNextProjectNumber() {
  const sequence = await prisma.sequence.upsert({
    where: { projectSequenceKey: "projectSequence" },
    update: { projectValue: { increment: 1 } },
    create: { projectSequenceKey: "projectSequence", projectValue: 1 },
  });

  return sequence.projectValue;
}

async function getNextCORNumber(project_id) {
  const sequence = await prisma.sequence.upsert({
    where: { project_id, corSequenceKey: "corSequence" },
    update: { corValue: { increment: 1 } },
    create: { corSequenceKey: "projectSequence", corValue: 1 },
  });

  return sequence.corValue;
}

async function getNextInvoiceNumber() {
  const sequence = await prisma.sequence.upsert({
    where: { invoiceSequenceKey: "invoiceSequence" },
    update: { invoiceValue: { increment: 1 } },
    create: { invoiceSequenceKey: "invoiceSequence", invoiceValue: 1 },
  });
  return sequence.invoiceValue;
}

async function getNextQuoteNumber() {
  const sequence = await prisma.sequence.upsert({
    where: { quoteSequenceKey: "quoteSequence" },
    update: { quoteValue: { increment: 1 } },
    create: { quoteSequenceKey: "quoteSequence", quoteValue: 1 },
  });
  return sequence.quoteValue;
}

async function getNextCustomerNumber() {
  const sequence = await prisma.sequence.upsert({
    where: { customerSequenceKey: "customerSequence" },
    update: { customerValue: { increment: 1 } },
    create: { customerSequenceKey: "customerSequence", customerValue: 1 },
  });
  return sequence.customerValue;
}

function formatSeqNumber(val) {
  if (val < 10) {
    return "00" + val.toString();
  } else if (val > 9 && val < 100) {
    return "0" + val.toString();
  } else {
    return val.toString();
  }
}

//Financial year : From 1st April' currentyear to 31st March' nextyear
const getInvoiceID = async () => {
  let val = getCalculatedYear();
  return "USICA/" + val[0] + "/" + formatSeqNumber(await getNextInvoiceNumber());
};

//Financial year : From 1st Jan' currentyear to 31st Dec' currentyear
const getQuoteID = async () => {
  //uncomment following 2 lines if march to april format is required.
  //let val = getCalculatedYear();
  //return "USICAQ" + val[1] + "-" + formatSeqNumber(await getNextQuoteNumber());

  let val = (new Date().getFullYear() - 2000).toString();
  return "USICAQ" + val + "-" + formatSeqNumber(await getNextQuoteNumber());
};

//Financial year : From 1st Jan' currentyear to 31st Dec' currentyear
const getProjectID = async () => {
  let val = (new Date().getFullYear() - 2000).toString();
  return val + "-" + formatSeqNumber(await getNextProjectNumber());
};

const getCustomerID = async () => {
  return await getNextCustomerNumber()
};

const getCORID = async () => {
  return await getNextProjectNumber();
};

module.exports = {
  getInvoiceID,
  getQuoteID,
  getProjectID,
  getCustomerID,
  getCORID
};
