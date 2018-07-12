import sqlite3
import random as r

print("Ingrese el archivo de la base de datos: ")
dbfile = input()

conn = sqlite3.connect(dbfile)
c = conn.cursor()

c.execute('''CREATE TABLE IF NOT EXISTS stalkers (
                id INTEGER PRIMARY KEY,
                user_id INTEGER
        )''')

c.execute('''CREATE TABLE IF NOT EXISTS mediciones (
		id INTEGER PRIMARY KEY,
		stalker_id INTEGER,
		timestamp INTEGER,
		corriente_ent INTEGER,
		corriente_sal INTEGER,
		tension_ent INTEGER,
		tension_sal INTEGER,
		bateria INTEGER,
		FOREIGN KEY (stalker_id) REFERENCES stalkers(id)
	)''')

print("Ingrese el valor de la ID unica del STALKER: ");
sta_id = int(input())

print("Ingrese la fecha y hora inicial en tiempo UNIX: ")
t0 = int(input())

print("Ingrese el valor inicial de tension de entrada en mV: ")
tens_ent = int(input())

print("Ingrese el valor inicial de tension de salida en mV: ")
tens_sal = int(input())

print("Ingrese el valor inicial de corriente de entrada en mA: ")
corr_ent = int(input())

print("Ingrese el valor inicial de corriente de salida en mA: ")
corr_sal = int(input())

print("Ingrese el valor inicial de bateria en centésimas de %: ");
bat = int(input())

print("Ingrese el tiempo entre mediciones en segundos: ")
dt = int(input())

print("Ingrese el numero de valores a generar e ingresar: ")
total = int(input())

fila = [sta_id, t0, corr_ent, corr_sal, tens_ent, tens_sal, bat]

for cont in range(total):
    c.execute('''INSERT INTO mediciones
                (stalker_id, timestamp, corriente_ent,
                corriente_sal, tension_ent, tension_sal, bateria)
                VALUES (?,?,?,?,?,?,?)''', fila)
    fila[1] = fila[1] + dt
    for x in range(2, len(fila)):
            fila[x] = fila[x] + 100 * r.gauss(0, 0.2)

conn.commit()
conn.close()
