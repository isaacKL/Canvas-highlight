const sql =require('mysql');


class Database{
    
    constructor(){
        this.con = sql.createConnection({
            host: "XYZ",
            user: "user",
            password: "",
            port:0000
        });
        
        /*this.con.connect(function(err) {
            console.log("ji");
            if (err) throw err;
            console.log("Connected!");

        });*/
        

    }
    //each persons semesesters credit,
    //cum credit, cum gpa, token, and role
    //
    getMembers(){
        let members=0;
        
            this.con.query("SELECT * FROM Members", function (err, result, fields) {
              //if (err) throw err;
               members=result;
               console.log(result);
            });
         
          return members;
    }
    populate(initData,name){
        this.con.connect(function(err) {
            if (err) throw err;
            let insertStatement="INSERT INTO Members(Name,Email,Cum_gpa,Cum_credits,credits,Token) VALUES (?,?,?,?,?,?)";
            initData.unshift(name)
            con.query(insertStatement, initData,function (err, result, fields) {
              if (err) throw err;
              var members=results;
            });
          });
    }
}

module.exports = Database;