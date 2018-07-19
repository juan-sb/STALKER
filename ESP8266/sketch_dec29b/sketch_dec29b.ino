#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <Ticker.h>
Ticker unixRTC;

union dosenuno {
  uint64_t valor;
  uint32_t mitades[2];
};

int contadorMedicionesTruchas = 0;
uint16 corr_ent[] = {2120, 2078, 2035, 1928, 1889, 1937, 1791, 1658, 1543, 1660};
uint16 corr_sal[] = {6541, 6388, 6344, 6329, 6189, 6314, 6501, 6324, 6304, 6326};
uint16 tens_ent[] = {19520, 19562, 19548, 19418, 19332, 19230, 19242, 19236, 19104, 19167};
uint16 tens_sal[] = {12125, 12001, 11946, 11894, 11898, 12216, 12151, 12244, 12360, 12430};
uint16 bat[] = {5000, 5108, 5085, 5085, 5196, 5100, 5116, 5319, 5185, 5211};


union dosenuno UNIXTIMESTAMP;

void contar() {
  UNIXTIMESTAMP.valor++;
  Serial.print(UNIXTIMESTAMP.mitades[1]);
  Serial.println(UNIXTIMESTAMP.mitades[0]);
}


const char* ssid = "Telecentro-47b0";
const char* pwd = "QPWGF3J7K4AL";
/*
const char* ssid = "Fibertel WiFi732 2.4GHz"; 
const char* pwd = "0041816767"; 
*/
char bufferS[256];
int cont = 0;
const int id = 2;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  WiFi.begin(ssid, pwd);

  Serial.println();
  Serial.println("Conectando a " +  String(ssid));
  while(WiFi.status() != WL_CONNECTED){
    Serial.print(".");
    delay(250);
  }
  Serial.println("Conectado exitosamente");
  HTTPClient http;
  http.begin("192.168.0.22", 3000, "/api/UNIXSERVERTIME");
  while(http.GET() != HTTP_CODE_OK){
    delay(50);
  }
  UNIXTIMESTAMP.valor = http.getString().toInt();
  unixRTC.attach(1, contar);
  http.end();
}

void loop() {
  //if(WiFi.status() == WL_CONNECTED){  
    HTTPClient http;
    http.begin("192.168.0.22", 3000, "/post");
    /*
    int httpCode = http.GET();
    String payload = http.getString();        
    Serial.println(httpCode);
    Serial.println(payload); 
    http.end();   
    */
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");
    String enviar = "id=";
    enviar += id;
    enviar += "&mac=";
    enviar += WiFi.macAddress();
    enviar += "&ts=";
    enviar += UNIXTIMESTAMP.mitades[1];
    enviar += UNIXTIMESTAMP.mitades[0];
    enviar += "&tensent=";
    enviar += tens_ent[contadorMedicionesTruchas];
    enviar += "&tenssal=";
    enviar += tens_sal[contadorMedicionesTruchas];
    enviar += "&corrent=";
    enviar += corr_ent[contadorMedicionesTruchas];
    enviar += "&corrsal=";
    enviar += corr_sal[contadorMedicionesTruchas];
    enviar += "&bater=";
    enviar += bat[contadorMedicionesTruchas];
    http.POST(enviar);
    http.writeToStream(&Serial);
    http.end();
    contadorMedicionesTruchas++;
    if(contadorMedicionesTruchas == 10)
      contadorMedicionesTruchas = 0;
    
  //}
  if(Serial.available()){
    bufferS[cont] = Serial.read();
    cont++;
  }
  delay(1000);
  
}
