const https = require("https");
const sleep = require('sleep');
const qs =require('querystring');
const stringinject =require('stringinject');
const fs = require('fs');


//grades is in enrollment;

class Canvas{
    constructor( canvas_token, website_root) {
        
        if (website_root.indexof("http://")!=-1){
            website_root = website_root;
        }   
        if  (website_root.indexof("https://")==-1){
            website_root = "https://"+ website_root;
        }
        this.website_root = website_root
            this.request_header = {
                hostname: this.website_root,
                path:'/',
                method: 'GET',
                headers:{
                "Authorization": "Bearer " + canvas_token,
                "Content-Type": "application/json",
                "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36"
                }
            };
        this.request_header.path='/api/v1/users/self';
        https.get(this.request_header,(res)=>{
            let body="";
            res.on('data',(data)=>{
                body+=data;
            });
            res.on('end',()=>{
                try{
                    let json=JSON.parse(body);
                    this.id=json.id;
                    this.name=json.name;
                }catch(error){
                    console.error(error.message);
                }
            });
        
        });
    }

    _get_request( url, params = {}, attempts = 5){/* -> Tuple[str, str]*/
        
        let tries = 0;
        while (tries < attempts){

                this.request_header.path=url+qs.stringify(params);
                https.get(this.request_header,(res)=>{
                    let body="";
                    res.on('data',(data)=>{
                        body+=data;
                    });
                    res.on('end',(end)=>{
                        try{
                            var json=JSON.parse(body);
                            return (json,res.headers['Link']);
                        }catch(error){
                            console.error(error.message);
                        }
                    });
                });
                tries += 1;
                if (tries == attempts){
                    console.error("Could not make a connection: "+url);
                }
                sleep.sleep(1);
            }
    }
    
    _get_all_pages( url, params = {}) {
        /*
        Get the full results from a query by following pagination links until the last page
        :param url: The URL for the query request
        :param params: A dictionary of parameter names and values to be sent with the request
        :return: The full list of result objects returned by the query
        */
        

        let [result, link_header] = this._get_request(url, params)

        var count = Object.keys(result).length;
        let page = 1;
        while (link_header.indexof('rel="next"')!=-1){
            page += 1;

            params.per_page= count;
            params.page = page;
            [next_result, link_header] = this._get_request(url, params);

            extend(result,next_result);

        return result
        }
    }    
    get_courses(){
        let result = this._get_all_pages('/api/v1/courses',
                                            {'state': ['available'],'enrollment_state':'active'});
        result.pop();
        result.shift();
        return result;
    
    }
    get_assignments(course_id,date){
        params={};
        var get =  (x,y) => { return this._get_all_pages(stringinject('/api/v1/courses/{course_id}/{item}', {'course_id':x,"item":y}),params)};
        var assignments = get(course_id,'assignments');
        var load=[], 
            exams=[], 
            assign=[];
        for(const assignment in assignments){
            try{
                this.request_header.path=stringinject('/api/v1/courses/{course_id}/assignments/{assignment_id}/submissions/{user_id}', {"course_id":course_id,"assignment_id":assignment.id,"user_id":this.id});
                let scoring=https.get(self.request_header,(res)=>{
                    let body="";
                    res.on('data',(data)=>{
                        body+=data;
                    });
                    res.on('end',(end)=>{
                        try{
                            let json=JSON.parse(body);
                            return (json,res.headers['Link']);
                        }catch(error){
                            console.error(error.message);
                        }
                    });
                });
                var score=-1;
                if ("score" in scoring ){
                    score=scoring.score;
                }
                if(score!=null){
                    score=int(score);
                }
                if(assignment.due_at!=null){
                    var due_date=new Date(assignment.due_at);
                    due_date=str(due_date);
                }else{
                    due_date=0;
                }    
                let today=Date.now();
                if (score>=0 || (today.getMilliseconds()-due_date.getMilliseconds()>0)){
                    name=assignment.name;
                    
                    points_possible=assignment.points_possible;
                    work={'name':name,'points_possible':points_possible,"points":score};
                    work_name=work[0].toLowerCase();
                    
                    if(('study' in work_name || "pre" in work_name) || !("test" in work_name || 'exam' in work_name || "final" in work_name)){
                        assign.push(work);
                    }else if(("test" in work_name || 'exam' in work_name || "final" in work_name)){
                        exams.push(work);
                    }
                }
            }catch(error){
                console.error(error.message);
            }
        }
        load.push(assign)
        load.push(exams)
        return load
    }
    getInfo(){
        return this.name;
    }
    getGrades(){
        fs.readFile('config.json', (err, data) => {
            if (err) throw err;
            var options = JSON.parse(data);
        });
        let result = this._get_all_pages('/api/v1/users'+this.id.toString()+"/enrollments",
                        {'state':'active'});
        result.pop();
        result.shift();
        let grades={};
        for(var i=0;i<result.length;i++){
            if(!result[i].course_id in options.ignore_class){
                grades.push(result[i]);
            }
        }
        return result;
    }
    submitAssignment(file_id,assignment_id,course_id){
        
        post={'name':file_params.name,
            'size':302185,
            'parent_folder_path':'my_files/'}
        response=requests.post(this.website_root+'/api/v1/courses/:course_id/assignments/:assignment_id/submissions',self.request_header,post)
        
        url=response.upload_url
        print(url)
        
    }
}



module.exports = Canvas;