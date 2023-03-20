function randomName()
{
  const {uniqueNamesGenerator, names} = require('unique-names-generator');
  let randomName= uniqueNamesGenerator({ dictionaries: [names] });
  return randomName;
}

function randomContact()
{
  const {NumberDictionary} = require('unique-names-generator');
  let contactNumber= "04000000"+NumberDictionary.generate({length:2}).toString();
  return contactNumber;
}

function randomNumber(length:number)
{
  const {NumberDictionary} = require('unique-names-generator');
  let codeNumber= NumberDictionary.generate({length:length}).toString();
  return codeNumber;
}

function randomDate(addDay: number,addMonth: number,addYear: number)
{
  let d = new Date();
    d.setDate(d.getDate()+addDay);
    d.setMonth(d.getMonth()+addMonth);
    d.setFullYear(d.getFullYear()+addYear);
  
    let year = String(d.getFullYear())
    let month = String(d.getMonth() + 1)
    let day = String(d.getDate())

    month = month.length == 1 ? 
        month.padStart(2, '0') : month;
    day = day.length == 1 ? 
        day.padStart(2, '0') : day;

let todayDate = `${day}-${month}-${year}`;
    return todayDate;
}

function competitionStartDate(day:string)
{
  if (day.toLowerCase()=='today') {
    let today = randomDate(0,0,0);
  return today;
  }
  else if (day.toLowerCase()=='tomorrow')
  {
    let tomorrow = randomDate(1,0,0);
  return tomorrow;
  }
  
}

function registrationStartDate(day:string)
{
  if (day.toLowerCase()=='today') {
    let today = randomDate(0,0,0);
  return today;
  }
  else if (day.toLowerCase()=='tomorrow')
  {
    let tomorrow = randomDate(1,0,0);
  return tomorrow;
  }
  
}

function registrationEndDate()
{
  let endDate = randomDate(0,3,0);
  return endDate;
}

function competitionEndDate()
{
  let endDate = randomDate(0,3,0);
  return endDate;
}

function birthDate(type:string)
{
  let age: any;
  if(type.toLowerCase()=='adult')
  age = 20;
  else if(type.toLowerCase()=='child')
  age = 10;
  let birthDate = randomDate(0,0,-age);
    return birthDate;
}

function randomAddress(stateName:string)
{
let address;
  switch (stateName.toLowerCase()) {
        case 'new south wales':
        address = "123 Mulgoa Rd, Penrith, 2750, NSW, Australia.";
        break;
        case 'victoria':
        address = "121 Exhibition St, Carlton, 3000, VIC, Australia.";
        break;
        case 'tasmania':
        address = "786 Adventure Bay Road, Adventure Bay TAS, Australia";
        break;
        case 'western australia':
        address = "140 William St, Perth, 6000, WA, Australia.";
        break;
        case 'south australia':
        address = "1718 South Para Road, Chain of Ponds SA, Australia";
        break;
        case 'queensland':
        address = "140 Elizabeth St, Brisbane City, 4000, QLD, Australia.";
        break;
  }
  return address;
}

export {randomName,randomContact,randomNumber,birthDate,randomAddress,competitionEndDate,registrationEndDate,registrationStartDate,competitionStartDate,randomDate};
