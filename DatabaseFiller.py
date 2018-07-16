import sqlite3
import random as r
import time
import sys
import os

for a in sys.argv:
    sys.stdout.write(a)
    sys.stdout.flush()
    
try: par = sys.argv[1]
except:
    print("Ingrese el archivo de la base de datos: ")
    dbfile = input()
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

try: par = sys.argv[2]
except:
    print("Ingrese el valor de la ID unica del STALKER: ")
    staid = int(input())
else: sta_id = int(sys.argv[2])

try: par = sys.argv[3]
except:
    print("Ingrese la fecha y hora inicial en tiempo UNIX ('ac' para el actual): ")
    t = input()
else: t = sys.argv[3]
t0 = int(time.time()) if (t == 'ac') else int(t)

try: par = sys.argv[4]
except:
    print("Ingrese el valor inicial de tension de entrada en mV: ")
    staid = int(input())
else: tens_ent = int(sys.argv[4])

try: par = sys.argv[5]
except:
    print("Ingrese el valor inicial de tension de salida en mV: ")
    tens_sal = int(input())
else: tens_sal = int(sys.argv[5])

try: par = sys.argv[6]
except:
    print("Ingrese el valor inicial de corriente de entrada en mA: ")
    corr_ent = int(input())
else: corr_ent = int(sys.argv[6])

try: par = sys.argv[7]
except:
    print("Ingrese el valor inicial de corriente de salida en mA: ")
    corr_sal = int(input())
else: corr_sal = int(sys.argv[7])

try: par = sys.argv[8]
except: 
    print("Ingrese el valor inicial de bateria en centesimas de porcentaje: ")
    bat = int(input())
else: bat = int(sys.argv[8])

try: par = sys.argv[9]
except:
    print("Ingrese el tiempo entre mediciones en segundos: ")
    dt = int(input())
else: dt = int(sys.argv[9])

try: par = sys.argv[10]
except:
    print("Ingrese el numero de valores a generar e ingresar: ")
    total = int(input())
else:
    syscall = True
    total = int(sys.argv[10])
print("")
sys.stdout.flush()
fila = [sta_id, t0, corr_ent, corr_sal, tens_ent, tens_sal, bat]

print("Fila normal: ")
print(fila)
c.execute('''BEGIN TRANSACTION''')
try:
    asd = sys.argv[11]
    print(asd)
    if(1):
        c.execute('''SELECT stalker_id, timestamp, corriente_ent,
                    corriente_sal, tension_ent, tension_sal, bateria
                    FROM mediciones ORDER BY timestamp DESC LIMIT 1''')
        try:
            op = c.fetchone()
            for cont in range(len(op)):
                fila[cont] = op[cont]
            print(fila)
        except:
            fila = [sta_id, t0, corr_ent, corr_sal, tens_ent, tens_sal, bat]
except: print("Error")

for cont in range(total):
    c.execute('''INSERT INTO mediciones
                (stalker_id, timestamp, corriente_ent,
                corriente_sal, tension_ent, tension_sal, bateria)
                VALUES (?,?,?,?,?,?,?)''', fila)
    if(1): print(fila)
    if((cont % 25) == 0): os.system('cls')
    fila[1] = fila[1] + dt
    for x in range(2, len(fila)):
            fila[x] = fila[x] + int(500 * (r.gauss(0, 0.2)))
            if(x == len(fila) - 1):
                while(fila[x] > 10000):
                        fila[x] = fila[x] + int(500 * (r.gauss(0, 0.2)))
                        fila[x] += 150
            while(fila[x] < 0):
                    fila[x] = fila[x] + int(500 * (r.gauss(0, 0.2)))

conn.commit()
conn.close()
print("Realizado")
