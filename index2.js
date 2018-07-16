const express = require('express')
const app = express()
const bodyParser = require('body-parser')
var Database = require('better-sqlite3')

const puerto = process.env.PORT || 3000; 

const dburl = './STALKERDB/StalkerDebug3.db';

var dbParam = "timestamp, corriente_ent, corriente_sal, tension_ent, tension_sal, bateria"
var timebase = 300;

var queryPromedios = dbParam.split(", ")
queryPromedios.forEach((element, index, array) => {
	array[index] = "AVG(" + element + ")"
});
queryPromedios = queryPromedios.join(", ");

var spawn = require('child_process').spawn
var p = spawn('py', ['DatabaseFiller.py', dburl, 1, 'ac',16500, 12050, 1530, 2609,	6590, 300, 100, 1, 1])

p.stdout.on('data', function(data) {
	console.log(data.toString())
})

var db = new Database(dburl)

db.exec(`CREATE TABLE IF NOT EXISTS stalkers (
	id INTEGER PRIMARY KEY,
	user_id INTEGER
)`);
db.exec(`CREATE TABLE IF NOT EXISTS mediciones (
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
		if(err) {
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
		if (req.staid) next()
		else res.send("Invalid id")
	})
})



app.get('/api/:staid', (req, res) => {
	var interv = req.query.interv
	var cantidad = req.query.cant
	var hinicial = req.query.hoin
	var pedirUltimos = req.query.ult
	if(cantidad) {
		if(hinicial){
			if(interv > 1) {
				var respuesta = [];
				var sql = "SELECT " + queryPromedios + " FROM mediciones WHERE timestamp BETWEEN (?) AND (?) AND stalker_id = (?)"
				var query = db.prepare(sql)

				function hacerPromesaGetDb(i){
					consoloe.log("ERSTOY HACIENDO LA PROMESA")
					return new Promise((resolve,reject)=>{
						consoloe.log("ERSTOY ADENTR5O DEL COSO DE LA PROMESA")
						query.get([
							(parseInt(hinicial) + (timebase * ((i- 1) * interv))), 
							(parseInt(hinicial) + (timebase * (i * interv - 1))), req.staid], 
							(err, row) => {
							if(err){
								reject(err)
							}else{
								resolve(row)
							}
						})
					})
					
				}

				let is=[]
				for(var i = 1; i <= cantidad; i++) {
					is.push(i)
				}
				consoloe.log("ERSTOY A PUNTA DE MANDAR .ALL")
				Promise.all(is.map(hacerPromesaGetDb)).then((rows)=>{
					console.log(rows)
					res.send(rows)
				})

			}
			else if(interv == 1 || !interv) {
				db.all(`SELECT (?) FROM mediciones WHERE timestamp BETWEEN (?) AND (?) AND stalker_id = (?)`, [
					(parseInt(hinicial) + (timebase * ((i- 1) * interv))), 
					(parseInt(hinicial) + (timebase * (i * interv - 1))), req.staid],
				(err, rows) => {
					if(err) console.log(err.message)
					res.send(rows)
				})
			}
		}
		else if(pedirUltimos) {

		}
		else {
			res.sendStatus(404)
		}
	}
})


app.get('/test2/:nombre', function (req, res) {
	res.send("Bienvenido, " + req.nombre)
})


app.post('/post/', function (req, res){
	res.send("Nombre: " + req.body.nom + '|Apellido: ' + req.body.ape + "|Mac: " + req.body.mac)
	db.run(`INSERT INTO mediciones (stalker_id, corriente_ent) VALUES ((?), (?))`, (req.body.id, req.body.ce))
})


app.listen(puerto, () => console.log("Corriendo servidor en el puerto " + puerto))