import sqlite3
import random as r
import time
import sys


print("Ingrese el archivo de la base de datos: ")
print(sys.argv)

try: sys.argv[1]
except: dbfile = input()
else: dbfile = sys.argv[1]
                 
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

print("Ingrese el valor de la ID unica del STALKER: ")
try: sys.argv[2]
except: staid = int(input())
else: sta_id = sys.argv[2]

print("Ingrese la fecha y hora inicial en tiempo UNIX ('ac' para el actual): ")
try: sys.argv[3]
except: t = input()
else: t = sys.argv[3]
t0 = int(time.time()) if (t == 'ac') else int(t)


print("Ingrese el valor inicial de tension de entrada en mV: ")
try: sys.argv[4]
except: staid = int(input())
else: tens_ent = sys.argv[4]

print("Ingrese el valor inicial de tension de salida en mV: ")
try: sys.argv[5]
except: tens_sal = int(input())
else: tens_sal = sys.argv[5]

print("Ingrese el valor inicial de corriente de entrada en mA: ")
try: sys.argv[6]
except: corr_ent = int(input())
else: corr_ent = sys.argv[6]


print("Ingrese el valor inicial de corriente de salida en mA: ")
try: sys.argv[7]
except: corr_sal = int(input())
else: corr_sal = sys.argv[7]

print("Ingrese el valor inicial de bateria en centésimas de %: ");
try: sys.argv[8]
except: bat = int(input())
else: bat = sys.argv[8]

print("Ingrese el tiempo entre mediciones en segundos: ")
try: sys.argv[9]
except: dt = int(input())
else: dt = sys.argv[9]

print("Ingrese el numero de valores a generar e ingresar: ")
try: sys.argv[10]
except: total = int(input())
else: total = sys.argv[10]

fila = [sta_id, t0, corr_ent, corr_sal, tens_ent, tens_sal, bat]

for cont in range(total):
    c.execute('''INSERT INTO mediciones
                (stalker_id, timestamp, corriente_ent,
                corriente_sal, tension_ent, tension_sal, bateria)
                VALUES (?,?,?,?,?,?,?)''', fila)
    print(fila)
    fila[1] = fila[1] + dt
    for x in range(2, len(fila)):
            fila[x] = fila[x] + int(500 * r.gauss(0, 0.2))
            if(x == len(fila)-1):
                while(fila[x] > 100 ):
                        fila[x] = fila[x] + int(500 * r.gauss(0, 0.2))
            while(fila[x] < 0):
                    fila[x] = fila[x] + int(500 * r.gauss(0, 0.2))
                

conn.commit()
conn.close()
print("Realizado")
sys.stdout.flush()
