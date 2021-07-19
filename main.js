const Canvas = require('./Canvas');
const Database = require('./Database');
const Docs = require('./docs');
const fs = require('fs');
const { DateTime } = require('mssql');
//
//Create a pdf for eboard and a general one for general members
//individual one for each person with future alerts
//For Eboard: include all member info including class,grades, gpa
//For General: include gpa(s) anonymously on graph
//All: include graph custom improvement statement
//
//


const conn_string="Data Source=(LocalDB)\\MSSQLLocalDB;AttachDbFilename=sh_db.mdf;Integrated Security=True;Connect Timeout=30";

const grade_conversion={"A":4,"B":3,"C":2,"D":1,"F":0,"U":-1,"S":5};

//person is a string with the name
//grades is a object with class grade and credits
//past is a array with number of past credits and current gpa
//return  gpa, semester and cummalitive and classes with C or lower in one array and a generate html bit for that person
function gpa(person,grades,past){
  var gpa=0;
  var flag=[];
  for(const _class in grades.classes){
    let grade=grade_conversion[grades.classes[_class]];
    if (grade<=2) flag.push(_class);
      //low grade
    
    gpa+=grade;
     
  }
  let semester=gpa/grades.credits;
  var cumalitive=-1;
  if(past!=null)  cummalitive=(gpa+(past.gpa*past.credits)/(grades.credits+past.credits));
  return  [semester,cummalitive,flag];
}

//the idea would be to add all past credits and average all gpa(s)
//and then add current classes grades and credits together
function fill(){
  let db=new Database();
  var members=db.getMembers();
  for(const person in members){
    let _canvas = new Canvas(person.token,"https://mst.instructure.com");
    let grades={"classes":_canvas.getGrades(),"credits":person.credits};
     console.log(_canvas.get_assignments(_canvas.get_courses()[0],"2021-05-03"));
    if (person.cum_gpa!=0){
      var past={"credits":person.Cum_credits,"gpa":person.Cum_gpa};
    }else{
      past=null;
    }
    let [sem,cum,flag] =gpa(person.name,grades,past);
    members[person].Sem_gpa=sem;
    members[person].Cum_gpa=cum;
    members[person].flags=flag;

  }
  return members;
}

//type refers to general or eboard/admin
//input is members, semester and cumalitive gpa

function generateDocs(members){
  let docs= new Docs();
  docs.setGeneral();
  fs.readFile('config.json', (err, data) => {
    if (err) throw err;
    var options = JSON.parse(data);
  });
  for(const person in members){
    docs.copy(person.name,docs.NEW_TEMPLATE_ID);
    let message=null;
    if(person.flag ||person.Sem_gpa<=2.5){
      message=options.personal_statement.bad;
    }else if(person.Sem_gpa>2.5 && person.Sem_gpa<3.0){
      message=options.personal_statement.okay;
    }else{
      message=options.personal_statement.good;
    }
    docs.getUser(message);
    docs.send(person.Email);
  }
}
//i is 4 things email/or time, credits, gpa, and token
function load(){
  let docs= new Docs();
  let db= new Database();
  for(const i in docs.getCodes()){
    let canvas=new Canvas(i[3]);
    db.populate(i,canvas.getInfo());
  }
}

//TODO: make a function to create the graph of all members gpa and the docs.send
//(switching owner to member and sharing with yourself) function
//create main with cron and load database with Google form(check second half)
//write canvas.getInfo and db.load(check)
//add enrollment for grades to canvasapi(check)



fill()

