const express = require("express")
const superagent = require('superagent');
const bodyParser = require("body-parser");
const router = express.Router();
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set("view options", {layout: false});
app.use(express.static(__dirname + '/views'));

app.get('/', function(req, res){
	res.render('/views/index.html');
});
router.post('/restart',(request,response) => {
	process.exit()
})
router.post('/handle',(request,response) => {
	try {
		superagent
			.post('https://api.replicate.com/v1/predictions')
			.set('Authorization', 'Token 3ca471ae3650b0e76d97656ad9d1171cd19c94fa')
			.set('Content-Type', 'application/json')
			.send({
				"version": "a9758cbfbd5f3c2094457d996681af52552901775aa2d6dd0b17fd15df959bef",
				"input": {
					"prompt": request.body.request_string
				}
			}) // sends a JSON post body
			.end((err, res) => {
				try {
					const getUrl = res._body.urls.get
					function waitForStatus(url){
						superagent
							.get(url)
							.set('Authorization', 'Token 3ca471ae3650b0e76d97656ad9d1171cd19c94fa')
							.set('Content-Type', 'application/json')
							.end((err, res) => {
								if (res._body.status === 'processing'){
									console.log('Waiting...')
									setTimeout(() => {
										waitForStatus(url)
									}, 1000)
								} else {
									response.send(res._body.output)
								}
							})
					}
					waitForStatus(getUrl);
				} catch(anotherError) {
					response.send({body: res._body, error: anotherError})
				}
			})
	} catch (sthError){
		response.send({body: request.body, error: sthError})
	}
});

app.use("/", router);

app.listen(8000);
console.log('Express server started');

