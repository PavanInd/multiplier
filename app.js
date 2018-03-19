var url = require('url');
var request = require('request');
var app   = require('http').createServer(handler);
var io    = require('socket.io')(app);
const sql = require('mssql');
 
sql.connect({
    server : 'multipliers.database.windows.net',
    user     : 'multiplier',
    password : 'Admin@Multi@500',
    database : 'targeted_stage',
    options: {
        encrypt : true
    }

}).then(pool => {
    console.log("success",pool);
}).catch(e => {
    console.log("error:",e);
});


var agentList = [];
app.listen( process.env.PORT || 4000 , () => console.log('Listening on 3000'));

io.on('connection', function (socket) {

    agentList[socket.id] = parseInt(socket.handshake.query.token);

    console.log(agentList[socket.id]);
    socket.emit("connected",{
        data : "200 OK"
    });

    socket.on('disconnect',()=>{
        delete agentList[socket.id];
    });

});



function handler (req, res) {
        var query = url.parse(req.url, true).query;
        console.log(query.agentid);
        io.sockets.to(agentList.indexOf(query.agentid)).emit("call",query);
        io.sockets.emit("call",query);
        res.end("200 OK");

        /**** send cURL request to PHP for inserting leads to CRM ****/
        //phpPush(query);
}

function phpPush(query){
        request( {
            method  : 'POST',
            uri     : 'https://stagingms.azurewebsites.net/tmv2/webhook/vicidial/vicidial_parse',
            body    : JSON.stringify(query)
        }, ()=>{
            res.end("200 OK");
        });    
}