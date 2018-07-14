const express = require('express')
const app = express()
const bodyParser = require('body-parser')
var sqlite3 = require('sqlite3').verbose()

const puerto = process.env.PORT || 3000; 

const dburl = './STALKERDB/StalkerDebug3.db';

/*
var PythonShell = require('python-shell')
var pysh = new PythonShell("DatabaseFiller.py")
var options = {
	mode:'text',
	pythonOptions: ['-u'],
	scriptPath: '',
	args: [dburl, 1, 'ac',16500, 12050, 1530, 2609,	6590, 300, 100]
}

PythonShell.run("", )
PythonShell.run('DatabaseFiller.py', options, function (err, results) {
	if (err) console.log("Python: " + err.message)
	console.log(results);
})
pysh.on('message', (message) => {
	console.log(message)
})
*/

var db = new sqlite3.Database(dburl, function (err) {
	if (err)
		console.error(err.message)
	else
		console.log("Conectado a la base de datos del sistema STALKER")
})

db.serialize(function() {
	db.run(`CREATE TABLE IF NOT EXISTS stalkers (
		id INTEGER PRIMARY KEY,
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
app.get('/api/getone', function (req, res) {
	if(!req.query.id){
		res.send("Invalid ID")
		return;
	}
	db.get(`SELECT * FROM mediciones WHERE id = (?)`, (req.query.id), function(err, row){
		if(err) console.log(err.message)
		else{
			console.log(row)
			res.send(row)
		}
	})
})


app.get('/api/rango', function (req, res) {
	if(!req.query.from || !req.query.to) {
		res.send("Argumentos erroneos")
		return;
	}
	db.all(`SELECT * FROM mediciones WHERE id BETWEEN (?) AND (?)`, [req.query.from, req.query.to], function (err, row) {
		if(err){
			console.log(err.message)
			throw err
		}
		console.log(row)
		res.send(row)
	})
})


app.get('/api/ult', function (req, res) {
	db.all(`SELECT * FROM mediciones WHERE stalker_id = (?) ORDER BY id DESC LIMIT (?)`, [req.query.staid, req.query.cant], function (err, row) {
		if(err){
			console.log(err.message)
			throw err
		}
		console.log(row)
		res.send(row)
	})
})


app.param('nombre', function (req, res, next, nombre) {
	req.nombre = (nombre == 'Juan') ? 'Admin Juan' : 'Random' + nombre;
	next();
})


app.param('staid', function(req, res, next, staid) {
	db.get(`SELECT * FROM stalkers WHERE id = (?)`, req.params.staid, function (err, row){
		if(err) console.log(err.message)
		req.staid = row ? req.params.staid : undefined
		if(req.staid) next()
		else res.send("Invalid id")
	})
})

/*
app.get('/api/:staid', (req, res) => {
	db.get(``,)
})
*/


app.get('/test2/:nombre', function (req, res) {
	res.send("Bienvenido, " + req.nombre)
})


app.post('/post/', function (req, res){
	res.send("Nombre: " + req.body.nom + '|Apellido: ' + req.body.ape + "|Mac: " + req.body.mac)
	db.run(`INSERT INTO mediciones (stalker_id, corriente_ent) VALUES ((?), (?))`, (req.body.id, req.body.ce))
})


app.listen(puerto, () => console.log("Corriendo servidor en el puerto " + puerto))