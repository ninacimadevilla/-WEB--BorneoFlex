export class Owned{
    constructor(public id:number,public nombre:string,public descripcion:string,public personas:number, public access:string,
    public mobiliario:string, public suministros:string, public networking:string, public skype:string, public guardabicis:string,
    public cantina:string, public impresora:string, public gimnasio:string,
    public salas_reuniones:string,public reception:string,public eventos_network:string,public terraza:string, 
    public cafe_relax:string, public seguridad:string,public limpieza:string,public cer_energetica:string,public paqueteria:string,
    public parking:string, public wifi:string, public coworking:string, public oficina_privada:string, public puesto_fijo:string,
    public puesto_flexible:string, public tarifa:number,public tipo_propiedad:string, public imagen:string, public direccion:string,
    public barrio:string, public ciudad:string, public comunidad_autonoma:string, public telefono:String, public imgUrl: any, public lat: number, public lng: number,
    public precio_oficina_privada:number, public precio_oficina_fija:number, public precio_puesto_flexible:number, 
    public rango_oficina_privada:string,public rango_oficina_fija:string, public rango_puesto_flexible:string){}
}