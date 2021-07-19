const {google} = require('googleapis');
const docs = google.docs('v1');
const fs = require('fs');

class Docs{

    constructor(){
        //authorization
         this.TEMPLATE_ID="";
        let SCOPES = ['https://www.googleapis.com/auth/documents.readonly',
                      'https://www.googleapis.com/auth/drive.file',
                      'https://www.googleapis.com/auth/spreadsheets.readonly'];
        let TOKEN_PATH = 'token.json';
        // Load client secrets from a local file.
        fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Docs API.
        authorize(JSON.parse(content), function(auth){
            console.log("Successfully connected");
            });
        });
    }

    authorize(credentials, callback) {
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        this.oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);
      
        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
          if (err) return getNewToken(this.oAuth2Client, callback);
          this.oAuth2Client.setCredentials(JSON.parse(token));
          callback(this.oAuth2Client);
        });
    }
      
    getNewToken( callback) {
        const authUrl = this.oAuth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: SCOPES,
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
          rl.close();
          this.oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            this.oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
              if (err) console.error(err);
              console.log('Token stored to', TOKEN_PATH);
            });
            callback(this.oAuth2Client);
          });
        });
    } 

    setGeneral(){
        this.copy("General",this.TEMPLATE_ID);
        fs.readFile('config.json', (err, data) => {
            if (err) throw err;
            var message = JSON.parse(data);
            
        });
        let overall_message = message.Overall_message;
        let date = yyyymmdd()
        let requests = [
          {
            replaceAllText: {
              containsText: {
                text: '{{overall message}}',
                matchCase: true,
              },
              replaceText: overall_message,
            },
          },
          {
            replaceAllText: {
              containsText: {
                text: '{{date}}',
                matchCase: true,
              },
              replaceText: date,
            },
          },
          {
            replaceImageRequest: {
                imageObjectId: string,
                uri: "./graph.jpg",
                imageReplaceMethod: "CENTER_CROP"
                
            },
          },
        ];
         this.NEW_TEMPLATE_ID=this.documentCopyId ;
        const docs=google.docs({version: 'v1', auth});
        docs.documents.batchUpdate(
                  {
                    documentId: this.NEW_TEMPLATE_ID,
                    resource: {
                      requests,
                    },
                  },
                  (err, {data}) => {
                    if (err) return console.log('The API returned an error: ' + err);
                    console.log(data);
                  });
            
    }

    //uses google drive
    copy(name,id){
        //copy document
        const drive = google.drive({version: 'v3', auth});
        this.name=name;
        var copyTitle = "SHPE Academic Report - "+name;
        let request = {
            name: copyTitle,
        };
        this.drive.files.copy({
            fileId: id,
            resource: request,
            }, (err, driveResponse) => {
                this.documentCopyId = driveResponse.id;}
        ); 
    }
    getUser(message){
        
        let requests = [
            {
              replaceAllText: {
                containsText: {
                  text: '{{Member}}',
                  matchCase: true,
                },
                replaceText: this.name,
              },
            },
            {
                replaceAllText: {
                  containsText: {
                    text: '{{Personal_statement}}',
                    matchCase: true,
                  },
                  replaceText: message
                }
              }
        ]
         
        const docs=google.docs({version: 'v1', auth});
        docs.documents.batchUpdate(
                  {
                    documentId: this.documentCopyId,
                    resource: {
                      requests,
                    },
                  },
                  (err, {data}) => {
                    if (err) return console.log('The API returned an error: ' + err);
                    console.log(data);
                  });
    }


    //uses google sheets
    getCodes(){
      const sheets = google.sheets({version: 'v4', auth});
      var newMembers=[];
      sheets.spreadsheets.values.get({
          spreadsheetId: '',
          range: 'Form Responses 2!B2:E',
        }, (err, res) => {
          if (err) return console.log('The API returned an error: ' + err);
          const rows = res.data.values;
          if (rows.length) {
            console.log('Name, Major:');
            // Print columns A and E, which correspond to indices 0 and 4.
            rows.map((row) => {
              newMembers.push(row);
          });
          } else {
            console.log('No data found.');
          }
        });
      return newMembers;
    }


    //transfers ownership
}

module.exports=Docs;