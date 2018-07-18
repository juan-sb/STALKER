import random as r
import time
import sys
import os

for a in sys.argv:
    sys.stdout.write(a)
    sys.stdout.flush()

try: par = sys.argv[1]
except:
    print("Ingrese el valor de la ID unica del STALKER: ")
    sta_id = int(input())
else: sta_id = int(sys.argv[2])

try: par = sys.argv[2]
except:
    print("Ingrese la fecha y hora inicial en tiempo UNIX ('ac' para el actual): ")
    t = input()
else: t = sys.argv[3]
t0 = int(time.time()) if (t == 'ac') else int(t)

try: par = sys.argv[4]
except:
    print("Ingrese el valor inicial de tension de entrada en mV: ")
    tens_ent = int(input())
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


fila = [sta_id, t0, corr_ent, corr_sal, tens_ent, tens_sal, bat]

file = open('Resultados.txt', 'w')

for mag in range(1, len(fila)):
    for lect in range(total):
        if(lect == 0):
            if(mag == 1): file.write("t = {")
            if(mag == 2): file.write("corr_ent = {")
            if(mag == 3): file.write("corr_sal = {")
            if(mag == 4): file.write("tens_ent = {")
            if(mag == 5): file.write("tens_sal = {")
            if(mag == 6): file.write("bat = {")
        
        file.write(str(fila[mag]))

        
        fila[mag] += int(500 * (r.gauss(0, 0.2)))
        while(fila[mag] < 0):
            fila[mag] += int(500 * (r.gauss(0, 0.2)))
        
        if(lect != total - 1):
            file.write(", ")
        else:
            file.write("}\n")
    
file.close()
print("Realizado")
