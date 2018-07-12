const express = require('express')
const app = express()
const bodyParser = require('body-parser')
var sqlite3 = require('sqlite3').verbose()

const puerto = process.env.PORT || 3000; 

const dburl = './STALKERDB/StalkerDebug.db';

var db = new sqlite3.Database(dburl, function (err) {
	if (err)
		console.error(err.message)
	else
		console.log("Conectado a la base de datos del sistema STALKER")
})

db.serialize(function() {
	db.run(`CREATE TABLE IF NOT EXISTS stalkers (
		stalker_id INTEGER PRIMARY KEY,
		user_id INTEGER
	)`);
	db.run(`CREATE TABLE IF NOT EXISTS mediciones (
		id INTEGER PRIMARY KEY,
		stalker_id INTEGER,
		timestamp INTEGER,
		corriente_ent INTEGER,
		corriente_sal INTEGER,
		tension_ent INTEGER,
		tension_sal INTEGER,
		bateria INTEGER,
		FOREIGN KEY (stalker_id) REFERENCES stalkers(stalker_id)
	)`);
})

db.parallelize();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


app.get('/', (req, res) => res.send("Hola mundo"))


app.get('/test1/desc', (req, res) => res.download('logoSTALKER.png', 'logo.png'))


//app.get('/:num', (req, res) => res.send("Has pedido " + req.params.num))
app.get('/api', function (req, res) {
	db.get(`SELECT * FROM mediciones WHERE id = (?)`, (req.query.id), function(err, row){
		if(err) console.log(err.message)
		else{
			var o = {
				"id": row.id,
				"stalker_id": row.stalker_id,
				"timestamp": row.timestamp,
				"tension_ent": row.tension_ent,
				"tension_sal": row.tension_sal,
				"corriente_ent": row.corriente_ent,
				"corriente_sal": row.corriente_sal,
				"bateria": row.bateria
			}
			console.log(o)
			res.send(o)
		}
	})
})
app.get('/json', function (req, res) {
	if (req.query.id > 0) {
	db.get(`SELECT * FROM mediciones WHERE id = (?)`, (req.query.id), function(err, row){
		if(err){ 
			console.log(err.message); 
			res.send("ERROR")
		}
		else{
			var o = {
				"id": row.id,
				"stalker_id": row.stalker_id,
				"timestamp": row.timestamp,
				"tension_ent": row.tension_ent,
				"tension_sal": row.tension_sal,
				"corriente_ent": row.corriente_ent,
				"corriente_sal": row.corriente_sal,
				"bateria": row.bateria
			}
			console.log(o)
			res.send(o)
		}
	})}
})

app.param('nombre', function (req, res, next, nombre) {
	req.nombre = (nombre == 'Juan') ? 'Admin Juan' : 'Random' + nombre;
	next();
})


app.get('/test2/:nombre', function (req, res) {
	res.send("Bienvenido, " + req.nombre)
})


app.post('/post/', function (req, res){
	res.send("Nombre: " + req.body.nom + '|Apellido: ' + req.body.ape + "|Mac: " + req.body.mac);
})

app.listen(puerto, () => console.log("Corriendo servidor en el puerto " + puerto))