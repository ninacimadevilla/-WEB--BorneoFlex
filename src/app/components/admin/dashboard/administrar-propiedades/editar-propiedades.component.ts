import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { PropiedadService } from '../../../../services/propiedad.service';
import { Owned } from '../../../../models/owned';
import { Imagenes } from 'src/app/models/images';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { GeoService, LocationInfo } from 'src/app/services/geo.service';
import { MapsAPILoader } from '@agm/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-editar-propiedades',
    templateUrl: './administrar-propiedades.component.html',
    styleUrls: ['./administrar-propiedades.component.scss'],
    providers: [PropiedadService]
})

export class EditarPropiedadesComponent implements OnInit {
    public propiedad: Owned;
    public propiedades: Array<Owned>;
    public filesToUpload: any = [];
    public img: Imagenes;
    public imagenesComprobar: Array<Imagenes>;
    public privada: boolean = false;
    public fija: boolean = false;
    public flexible: boolean = false;
    //variable para previsualizar
    public previsualizacion: Array<string> = [];
    public barrios: Array<string> = [];
    public barrioBarcelona = ['Centro Ciudad', 'Alta Diagonal', 'Paseo de Gracia', 'Ciutat Vella', '22@', 'Extrarradio'];
    public barrioMadrid = ['Salamanca', 'Retiro', 'Chamberi', 'Moncloa', 'Chamartin', 'Cuzco-Cuatro Torres', 'Azca', 'Centro', 'Atocha', 'A1', 'A2', 'A6', 'Periferia'];
    public archivo = [];
    public rango = 0;
    public imagenesguardadas = 0;
    public submit: boolean = false;
    public previsualizacionDestaca: string;
    public destacada;

    private geoCoder;
    @ViewChild("search") public searchElementRef: ElementRef;
    locationInfo: LocationInfo;

    get nombreNoValido() {
        return this.propertyForm.get("nombre").invalid && this.propertyForm.get("nombre").touched;
    }
    get personasNoValido() {
        return this.propertyForm.get("personas").invalid && this.propertyForm.get("personas").touched;
    }
    get tarifaNoValido() {
        return this.propertyForm.get("tarifa").invalid && this.propertyForm.get("tarifa").touched;
    }
    get barrioNoValido() {
        return this.propertyForm.get("barrio").invalid && this.propertyForm.get("barrio").touched;
    }
    get ciudadNoValido() {
        return this.propertyForm.get("ciudad").invalid && this.propertyForm.get("ciudad").touched;
    }
    get telefonoNoValido() {
        return this.propertyForm.get("telefono").invalid && this.propertyForm.get("telefono").touched;
    }

    ngOnInit(): void {
        this.recogerDato();

        this.mapsApi.load().then(() => {
            this.geoCoder = new google.maps.Geocoder;

            const autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
            autocomplete.addListener("place_changed", () => {
                this.ngZone.run(() => {
                    //get the place result
                    const place: google.maps.places.PlaceResult = autocomplete.getPlace();
                    //verify result
                    if (place.geometry === undefined || place.geometry === null) {
                        return;
                    }
                    let locationInfo: LocationInfo = GeoService.getProvince(place.formatted_address);
                    locationInfo.lat = place.geometry.location.lat();
                    locationInfo.lng = place.geometry.location.lng();
                    this.locationInfo = locationInfo;
                });
            });
        });
    }

    propertyForm = new FormGroup({
        nombre: new FormControl(''),
        descripcion: new FormControl(''),
        personas: new FormControl('', [Validators.required, Validators.pattern("^[0-9]{1,50}$")]),
        access: new FormControl(false),
        mobiliario: new FormControl(false),
        suministros: new FormControl(false),
        networking: new FormControl(false),
        skype: new FormControl(false),
        guardabicis: new FormControl(false),
        cantina: new FormControl(false),
        impresora: new FormControl(false),
        gimnasio: new FormControl(false),
        salas_reuniones: new FormControl(false),
        reception: new FormControl(false),
        eventos_network: new FormControl(false),
        terraza: new FormControl(false),
        cafe_relax: new FormControl(false),
        seguridad: new FormControl(false),
        limpieza: new FormControl(false),
        cer_energetica: new FormControl(false),
        paqueteria: new FormControl(false),
        parking: new FormControl(false),
        wifi: new FormControl(false),
        coworking: new FormControl(false),
        oficina_privada: new FormControl(false),
        puesto_fijo: new FormControl(false),
        puesto_flexible: new FormControl(false),
        tarifa: new FormControl('', [Validators.required, Validators.pattern("^[0-9]{1,50}$")]),
        tipo_propiedad: new FormControl(''),
        direccion: new FormControl(''),
        barrio: new FormControl(''),
        ciudad: new FormControl(''),
        comunidad_autonoma: new FormControl(''),
        telefono: new FormControl('', [Validators.required, Validators.pattern("^[0-9]{9}$")]),
        lat: new FormControl(0.000000),
        lng: new FormControl(0.000000),

        precio_oficina_privada: new FormControl(0),
        precio_oficina_fija: new FormControl(0),
        precio_puesto_flexible: new FormControl(0),
        rango_oficina_privada: new FormControl(''),
        rango_oficina_fija: new FormControl(''),
        rango_puesto_flexible: new FormControl(''),
    });

    constructor(private _route: ActivatedRoute, private _router: Router, private _propiedadService: PropiedadService,
        private fb: FormBuilder, private mapsApi: MapsAPILoader, private ngZone: NgZone, private sanitizer: DomSanitizer) {
    }

    recogerDato() {
        this._route.params.forEach((params: Params) => {
            let id = params['id'];

            this._propiedadService.getPropiedad(id).subscribe(
                response => {
                    this.propiedad = response;

                    for (let i in this.propiedad) {
                        this.propertyForm.get('nombre').setValue(this.propiedad[i].nombre);
                        this.propertyForm.get('descripcion').setValue(this.propiedad[i].descripcion);
                        this.propertyForm.get('personas').setValue(this.propiedad[i].personas);

                        if (this.propiedad[i].access == "true") {
                            this.propertyForm.get('access').setValue(true);
                        } else {
                            this.propertyForm.get('access').setValue(false);
                        }
                        //---------------------------------------------------
                        if (this.propiedad[i].mobiliario == "true") {
                            this.propertyForm.get('mobiliario').setValue(true);
                        } else {
                            this.propertyForm.get('mobiliario').setValue(false);
                        }
                        if (this.propiedad[i].suministros == "true") {
                            this.propertyForm.get('suministros').setValue(true);
                        } else {
                            this.propertyForm.get('suministros').setValue(false);
                        }
                        if (this.propiedad[i].networking == "true") {
                            this.propertyForm.get('networking').setValue(true);
                        } else {
                            this.propertyForm.get('networking').setValue(false);
                        }
                        if (this.propiedad[i].skype == "true") {
                            this.propertyForm.get('skype').setValue(true);
                        } else {
                            this.propertyForm.get('skype').setValue(false);
                        }
                        if (this.propiedad[i].guardabicis == "true") {
                            this.propertyForm.get('guardabicis').setValue(true);
                        } else {
                            this.propertyForm.get('guardabicis').setValue(false);
                        }
                        if (this.propiedad[i].cantina == "true") {
                            this.propertyForm.get('cantina').setValue(true);
                        } else {
                            this.propertyForm.get('cantina').setValue(false);
                        }
                        if (this.propiedad[i].impresora == "true") {
                            this.propertyForm.get('impresora').setValue(true);
                        } else {
                            this.propertyForm.get('impresora').setValue(false);
                        }
                        if (this.propiedad[i].gimnasio == "true") {
                            this.propertyForm.get('gimnasio').setValue(true);
                        } else {
                            this.propertyForm.get('gimnasio').setValue(false);
                        }
                        //-----------------------------------------------------
                        if (this.propiedad[i].salas_reuniones == "true") {
                            this.propertyForm.get('salas_reuniones').setValue(true);
                        } else {
                            this.propertyForm.get('salas_reuniones').setValue(false);
                        }
                        if (this.propiedad[i].reception == "true") {
                            this.propertyForm.get('reception').setValue(true);
                        } else {
                            this.propertyForm.get('reception').setValue(false);
                        }
                        if (this.propiedad[i].eventos_network == "true") {
                            this.propertyForm.get('eventos_network').setValue(true);
                        } else {
                            this.propertyForm.get('eventos_network').setValue(false);
                        }
                        if (this.propiedad[i].terraza == "true") {
                            this.propertyForm.get('terraza').setValue(true);
                        } else {
                            this.propertyForm.get('terraza').setValue(false);
                        }
                        if (this.propiedad[i].cafe_relax == "true") {
                            this.propertyForm.get('cafe_relax').setValue(true);
                        } else {
                            this.propertyForm.get('cafe_relax').setValue(false);
                        }
                        if (this.propiedad[i].seguridad == "true") {
                            this.propertyForm.get('seguridad').setValue(true);
                        } else {
                            this.propertyForm.get('seguridad').setValue(false);
                        }
                        if (this.propiedad[i].limpieza == "true") {
                            this.propertyForm.get('limpieza').setValue(true);
                        } else {
                            this.propertyForm.get('limpieza').setValue(false);
                        }
                        if (this.propiedad[i].cer_energetica == "true") {
                            this.propertyForm.get('cer_energetica').setValue(true);
                        } else {
                            this.propertyForm.get('cer_energetica').setValue(false);
                        }
                        if (this.propiedad[i].paqueteria == "true") {
                            this.propertyForm.get('paqueteria').setValue(true);
                        } else {
                            this.propertyForm.get('paqueteria').setValue(false);
                        }
                        if (this.propiedad[i].parking == "true") {
                            this.propertyForm.get('parking').setValue(true);
                        } else {
                            this.propertyForm.get('parking').setValue(false);
                        }
                        if (this.propiedad[i].wifi == "true") {
                            this.propertyForm.get('wifi').setValue(true);
                        } else {
                            this.propertyForm.get('wifi').setValue(false);
                        }
                        if (this.propiedad[i].coworking == "true") {
                            this.propertyForm.get('coworking').setValue(true);
                        } else {
                            this.propertyForm.get('coworking').setValue(false);
                        }
                        if (this.propiedad[i].oficina_privada == "true") {
                            this.propertyForm.get('oficina_privada').setValue(true);
                            this.privada = true;
                        } else {
                            this.propertyForm.get('oficina_privada').setValue(false);
                        }
                        if (this.propiedad[i].puesto_fijo == "true") {
                            this.propertyForm.get('puesto_fijo').setValue(true);
                            this.fija = true;
                        } else {
                            this.propertyForm.get('puesto_fijo').setValue(false);
                        }
                        if (this.propiedad[i].puesto_flexible == "true") {
                            this.propertyForm.get('puesto_flexible').setValue(true);
                            this.flexible = true;
                        } else {
                            this.propertyForm.get('puesto_flexible').setValue(false);
                        }

                        this.propertyForm.get('tarifa').setValue(this.propiedad[i].tarifa);
                        this.propertyForm.get('tipo_propiedad').setValue(this.propiedad[i].tipo_propiedad);
                        this.propertyForm.get('direccion').setValue(this.propiedad[i].direccion);

                        if (this.privada == true) {
                            this.propertyForm.get('precio_oficina_privada').setValue(this.propiedad[i].precio_oficina_privada);
                            this.propertyForm.get('rango_oficina_privada').setValue(this.propiedad[i].rango_oficina_privada);
                        }
                        if (this.fija == true) {
                            this.propertyForm.get('precio_oficina_fija').setValue(this.propiedad[i].precio_oficina_fija);
                            this.propertyForm.get('rango_oficina_fija').setValue(this.propiedad[i].rango_oficina_fija);   
                        }
                        if (this.flexible == true) {
                            this.propertyForm.get('precio_puesto_flexible').setValue(this.propiedad[i].precio_puesto_flexible);
                            this.propertyForm.get('rango_puesto_flexible').setValue(this.propiedad[i].rango_puesto_flexible);
                        }

                        //recoger los barrios
                        //creamos un contador iniciado en 1, la posicion 0 va reservada al dato de la base de datos
                        var contadorBarrios = 1;
                        //comprobamos la ciudad en caso de ser barcelona o madrid ya que estas tienen barrios, el resto no
                        if (this.propiedad[i].ciudad == 'Barcelona') {
                            //la posicion 0 del barrio va reservada a la bd el resto a las distintos barrios de la ciudad en cuestion
                            this.barrios[0] = this.propiedad[i].barrio;
                            //recorremos el array de la ciudad
                            for (let j = 0; j < this.barrioBarcelona.length; j++) {
                                //si el barrio de la bd es distinto del barrio de barcelona lo guardamos, asi no repetimos un barrio 
                                if (this.barrios[0] != this.barrioBarcelona[j]) {
                                    this.barrios[contadorBarrios] = this.barrioBarcelona[j];
                                    contadorBarrios++;
                                }
                            }
                        } else if (this.propiedad[i].ciudad == 'Madrid') {
                            this.barrios[0] = this.propiedad[i].barrio;
                            for (let j = 0; j < this.barrioMadrid.length; j++) {
                                if (this.barrios[0] != this.barrioMadrid[j]) {
                                    this.barrios[contadorBarrios] = this.barrioMadrid[j];
                                    contadorBarrios++;
                                }
                            }
                        } else {
                            //en caso de no ser madrid o barcelona solo existe un barrio por cada ciudad restante por lo que no es necesario
                            //ningun bucle
                            this.barrios[0] = this.propiedad[i].barrio;
                        }
                        this.propertyForm.get('barrio').setValue(this.propiedad[i].barrio);
                        this.propertyForm.get('ciudad').setValue(this.propiedad[i].ciudad);
                        this.propertyForm.get('comunidad_autonoma').setValue(this.propiedad[i].comunidad_autonoma);
                        this.propertyForm.get('telefono').setValue(this.propiedad[i].telefono);
                        if (this.propiedad[i].lat) {
                            this.propertyForm.get('lat').setValue(this.propiedad[i].lat);
                        }
                        if (this.propiedad[i].lng) {
                            this.propertyForm.get('lng').setValue(this.propiedad[i].lng);
                        }
                    }

                    this.listarImagenesCompletas();
                }, error => {
                    console.log(<any>error);
                }
            );
        });
    }

    listarImagenesCompletas() {
        this._route.params.forEach((params: Params) => {
            let id = params['id'];
            this._propiedadService.listadoCompletoImagenes(id).subscribe(
                response => {
                    this.imagenesComprobar = response;

                    if (this.imagenesComprobar.length > 0) {
                        this.imagenesguardadas = 1;
                        this.imagenesComprobar.forEach(element => {
                            element.imagen = element.imagen.slice(2, -2);
                        });
                    }

                }, error => {
                    console.log(<any>error);
                }
            );
        });
    }

    borrarGuardadas(idImagen) {
        this._propiedadService.deleteImagenes(idImagen).subscribe(
            response => {
                this.listarImagenesCompletas();
            },
            error => {
                console.log(<any>error);
            }
        );

    }

    fileChangeEvent(fileInput: any) {
        /*variable para guardar el nombre de las imagenes
        var archivo = [];*/

        //rellenamos la variable con las imagenes que se acaban de enlazar
        if (this.archivo.length <= 0) {
            for (let i = 0; i < fileInput.target.files.length; i++) {
                this.archivo[i] = fileInput.target.files[i];
            }
        } else {
            let contador = 0;
            for (let i = this.rango; i < (fileInput.target.files.length + this.rango); i++) {
                this.archivo[i] = fileInput.target.files[contador];
                contador++;
            }
        }

        if (this.rango == 0) {
            this.rango = fileInput.target.files.length;
        } else {
            this.rango = fileInput.target.files.length + this.rango;
        }

        this.mostrarImagenes(this.archivo);
    }

    fileChangeEvent1(fileInput: any) {
        this.destacada = fileInput.target.files[0];

        this.mostrarImagenDestacada(this.destacada);

    }

    borrar(dato) {
        for (let i = dato; i < this.archivo.length; i++) {
            if (i == (this.archivo.length - 1)) {
                this.archivo.splice(i);
            } else {
                this.archivo[i] = this.archivo[i + 1];
            }
        }
        this.rango = this.rango - 1;

        this.mostrarImagenes(this.archivo);
    }

    borrarDestacada() {
        this.destacada = "";

        this.mostrarImagenDestacada(this.destacada);
    }

    mostrarImagenes(archivo) {
        //contador para recorrer el array vacio y llenarlo (el array donde se guardan las imagenes)
        var contadorAyudaImagenes = 0;
        this.previsualizacion = [];

        this.archivo = archivo;
        //recorremos este array y vamos leyendo imagen por imagen para ir previsualizandola
        this.archivo.forEach(element => {
            this.extraerBase64(element).then((imagen: any) => {
                //guardamos la base de la imagen para previsualizarla
                this.previsualizacion[contadorAyudaImagenes] = imagen.base;
                //aumentamos el contador
                contadorAyudaImagenes++;
            });
        });
    }

    mostrarImagenDestacada(imagenDestacada) {
        this.destacada = imagenDestacada;
        this.previsualizacionDestaca = "";

        this.extraerBase64(this.destacada).then((imagen: any) => {
            //guardamos la base de la imagen para previsualizarla
            this.previsualizacionDestaca = imagen.base;
        });
    }

    cambiarBarrios() {
        var ciudad = <HTMLInputElement>document.getElementById("ciudad");
        if (ciudad.value == 'Barcelona') {
            this.barrios = ['Centro Ciudad', 'Alta Diagonal', 'Paseo de Gracia', 'Ciutat Vella', '22@', 'Extrarradio'];
        } else if (ciudad.value == 'Madrid') {
            this.barrios = ['Salamanca', 'Retiro', 'Chamberi', 'Moncloa', 'Chamartin', 'Cuzco-Cuatro Torres', 'Azca', 'Centro', 'Atocha', 'A1', 'A2', 'A6', 'Periferia'];
        } else if (ciudad.value == 'Oviedo') {
            this.barrios = ['Oviedo'];
        } else if (ciudad.value == 'Malaga') {
            this.barrios = ['Malaga'];
        } else if (ciudad.value == 'Valencia') {
            this.barrios = ['Valencia'];
        } else if (ciudad.value == 'Sevilla') {
            this.barrios = ['Sevilla'];
        } else if (ciudad.value == 'Bilbao') {
            this.barrios = ['Bilbao'];
        }
    }

    public datosPrivada() {
        if (this.privada == false) {
            this.privada = true;
        } else {
            this.privada = false;
        }
    }

    public datosFija() {
        if (this.fija == false) {
            this.fija = true;
        } else {
            this.fija = false;
        }
    }

    public datosFlexible() {
        if (this.flexible == false) {
            this.flexible = true;
        } else {
            this.flexible = false;
        }
    }

    onSubmit() {
        //evento para capturar la imagen
        for (let i = 0; i < this.archivo.length; i++) {
            this.filesToUpload.push(this.archivo[i]);
        }

        if (this.destacada != undefined && this.destacada != "") {
            this.filesToUpload.push(this.destacada);
            for (let i = 0; i < this.imagenesComprobar.length; i++) {
                if (this.imagenesComprobar[i].destacado == 1) {
                    this.borrarGuardadas(this.imagenesComprobar[i].id);
                }
            }
        }

        if (this.filesToUpload.length > 0) {
            this._propiedadService.makeFileRequest(this.filesToUpload).subscribe(
                result => {
                    this.filesToUpload = result;
                    this.modificarDato();

                }, error => {
                    console.log(error);
                }
            )
        } else {
            this.modificarDato();
        }
    }

    modificarDato() {
        this._route.params.forEach((params: Params) => {
            let id = params['id'];

            if (this.propertyForm.get('access').value == true) {
                this.propertyForm.get('access').setValue("true");
            } else {
                this.propertyForm.get('access').setValue("false");
            }

            if (this.propertyForm.get('mobiliario').value == true) {
                this.propertyForm.get('mobiliario').setValue("true");
            } else {
                this.propertyForm.get('mobiliario').setValue("false");
            }

            if (this.propertyForm.get('suministros').value == true) {
                this.propertyForm.get('suministros').setValue("true");
            } else {
                this.propertyForm.get('suministros').setValue("false");
            }

            if (this.propertyForm.get('networking').value == true) {
                this.propertyForm.get('networking').setValue("true");
            } else {
                this.propertyForm.get('networking').setValue("false");
            }

            if (this.propertyForm.get('skype').value == true) {
                this.propertyForm.get('skype').setValue("true");
            } else {
                this.propertyForm.get('skype').setValue("false");
            }

            if (this.propertyForm.get('guardabicis').value == true) {
                this.propertyForm.get('guardabicis').setValue("true");
            } else {
                this.propertyForm.get('guardabicis').setValue("false");
            }

            if (this.propertyForm.get('cantina').value == true) {
                this.propertyForm.get('cantina').setValue("true");
            } else {
                this.propertyForm.get('cantina').setValue("false");
            }

            if (this.propertyForm.get('impresora').value == true) {
                this.propertyForm.get('impresora').setValue("true");
            } else {
                this.propertyForm.get('impresora').setValue("false");
            }

            if (this.propertyForm.get('gimnasio').value == true) {
                this.propertyForm.get('gimnasio').setValue("true");
            } else {
                this.propertyForm.get('gimnasio').setValue("false");
            }

            if (this.propertyForm.get('salas_reuniones').value == true) {
                this.propertyForm.get('salas_reuniones').setValue("true");
            } else {
                this.propertyForm.get('salas_reuniones').setValue("false");
            }

            if (this.propertyForm.get('reception').value == true) {
                this.propertyForm.get('reception').setValue("true");
            } else {
                this.propertyForm.get('reception').setValue("false");
            }

            if (this.propertyForm.get('eventos_network').value == true) {
                this.propertyForm.get('eventos_network').setValue("true");
            } else {
                this.propertyForm.get('eventos_network').setValue("false");
            }

            if (this.propertyForm.get('terraza').value == true) {
                this.propertyForm.get('terraza').setValue("true");
            } else {
                this.propertyForm.get('terraza').setValue("false");
            }

            if (this.propertyForm.get('cafe_relax').value == true) {
                this.propertyForm.get('cafe_relax').setValue("true");
            } else {
                this.propertyForm.get('cafe_relax').setValue("false");
            }

            if (this.propertyForm.get('seguridad').value == true) {
                this.propertyForm.get('seguridad').setValue("true");
            } else {
                this.propertyForm.get('seguridad').setValue("false");
            }

            if (this.propertyForm.get('limpieza').value == true) {
                this.propertyForm.get('limpieza').setValue("true");
            } else {
                this.propertyForm.get('limpieza').setValue("false");
            }
            if (this.propertyForm.get('cer_energetica').value == true) {
                this.propertyForm.get('cer_energetica').setValue("true");
            } else {
                this.propertyForm.get('cer_energetica').setValue("false");
            }
            if (this.propertyForm.get('paqueteria').value == true) {
                this.propertyForm.get('paqueteria').setValue("true");
            } else {
                this.propertyForm.get('paqueteria').setValue("false");
            }
            if (this.propertyForm.get('parking').value == true) {
                this.propertyForm.get('parking').setValue("true");
            } else {
                this.propertyForm.get('parking').setValue("false");
            }
            if (this.propertyForm.get('wifi').value == true) {
                this.propertyForm.get('wifi').setValue("true");
            } else {
                this.propertyForm.get('wifi').setValue("false");
            }
            if (this.propertyForm.get('coworking').value == true) {
                this.propertyForm.get('coworking').setValue("true");
            } else {
                this.propertyForm.get('coworking').setValue("false");
            }
            if (this.propertyForm.get('oficina_privada').value == true) {
                this.propertyForm.get('oficina_privada').setValue("true");
            } else {
                this.propertyForm.get('oficina_privada').setValue("false");
            }
            if (this.propertyForm.get('puesto_fijo').value == true) {
                this.propertyForm.get('puesto_fijo').setValue("true");
            } else {
                this.propertyForm.get('puesto_fijo').setValue("false");
            }
            if (this.propertyForm.get('puesto_flexible').value == true) {
                this.propertyForm.get('puesto_flexible').setValue("true");
            } else {
                this.propertyForm.get('puesto_flexible').setValue("false");
            }

            if (this.locationInfo && this.locationInfo.lat) {
                this.propertyForm.value.lat = this.locationInfo.lat;
            }
            if (this.locationInfo && this.locationInfo.lng) {
                this.propertyForm.value.lng = this.locationInfo.lng;
            }

            this._propiedadService.editPropiedad(id, this.propertyForm.value).subscribe(
                result => {
                    if (this.filesToUpload.length == 0) {
                        this._router.navigate(['admin/dashboard/listPropertys']);
                    } else {
                        for (let i = 0; i < this.filesToUpload.length; i++) {
                            if (this.destacada) {
                                if (i < (this.filesToUpload.length - 1)) {
                                    var json = JSON.stringify(this.filesToUpload[i]);
                                    this.img = new Imagenes(null, json, 0, id);
                                    this.guardarImagen();
                                } else if (i == (this.filesToUpload.length - 1)) {
                                    var json = JSON.stringify(this.filesToUpload[i]);
                                    this.img = new Imagenes(null, json, 1, id);
                                    this.guardarImagen();
                                }
                            } else {
                                var json = JSON.stringify(this.filesToUpload[i]);
                                this.img = new Imagenes(null, json, 0, id);
                                this.guardarImagen();
                            }

                        }
                    }
                },

                error => {
                    console.log(<any>error);
                }
            );
        });
    }

    guardarImagen() {
        this._propiedadService.addimagenes(this.img).subscribe(
            result => {
                this._router.navigate(['admin/dashboard/listPropertys']);
            },
            error => {
                console.log(<any>error);
            }
        );
    }

    extraerBase64 = async ($event: any) => new Promise((resolve, reject) => {
        try {
            const unsafeImg = window.URL.createObjectURL($event);
            const image = this.sanitizer.bypassSecurityTrustUrl(unsafeImg);
            const reader = new FileReader();
            reader.readAsDataURL($event);
            reader.onload = () => {
                resolve({
                    base: reader.result
                });
            };
            reader.onerror = error => {
                resolve({
                    base: null
                });
            };

        } catch (e) {
            return null;
        }
    })

}
