import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { PropiedadService } from '../../../../services/propiedad.service';
import { Owned } from '../../../../models/owned';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Imagenes } from 'src/app/models/images';
import { MapsAPILoader } from '@agm/core';
import { GeoService, LocationInfo } from 'src/app/services/geo.service';
import { elementAt } from 'rxjs/operators';
import { element } from 'protractor';

@Component({
  selector: 'app-administrar-propiedades',
  templateUrl: './administrar-propiedades.component.html',
  styleUrls: ['./administrar-propiedades.component.scss'],
  providers: [PropiedadService]
})
export class AdministrarPropiedadesComponent implements OnInit {
  public propiedad: Owned;
  public propiedades: Array<Owned>;
  public filesToUpload: any = [];
  public img: Imagenes;
  public idPropiedades;
  public previsualizacion: Array<string> = [];
  public previsualizacionDestaca: string;
  public barrios: Array<string> = ['Sin barrio'];
  public privada: boolean = false;
  public fija: boolean = false;
  public flexible: boolean = false;
  public archivo = [];
  public rango = 0;
  public imagenesguardadas = 0;
  public destacada;
  private geoCoder;

  @ViewChild("search") public searchElementRef: ElementRef;
  locationInfo: LocationInfo;

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

    precio_oficina_privada: new FormControl(0),
    precio_oficina_fija: new FormControl(0),
    precio_puesto_flexible: new FormControl(0),
    rango_oficina_privada: new FormControl(''),
    rango_oficina_fija: new FormControl(''),
    rango_puesto_flexible: new FormControl(''),
  });

  constructor(private _route: ActivatedRoute, private _router: Router, private _propiedadService: PropiedadService,
    private fb: FormBuilder, private sanitizer: DomSanitizer, private mapsApi: MapsAPILoader, private ngZone: NgZone) {
  }

  ngOnInit(): void {
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
  get telefonoNoValido() {
    return this.propertyForm.get("telefono").invalid && this.propertyForm.get("telefono").touched;
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

  onSubmit() {
    //evento para capturar la imagen
    for (let i = 0; i < this.archivo.length; i++) {
      this.filesToUpload.push(this.archivo[i]);
    }

    if (this.destacada != undefined && this.destacada != "") {
      this.filesToUpload.push(this.destacada);
    }

    if (this.filesToUpload.length > 0) {
      this._propiedadService.makeFileRequest(this.filesToUpload).subscribe(
        result => {
          this.filesToUpload = result;
          this.guardarProducto();
        }, error => {
          console.log(error);
        }
      )
    } else {
      this.guardarProducto();
    }
  }

  guardarProducto() {
    //al no existir un boolean false/true en mysql hay que pasar cada uno de ellos a string "false" "true"
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

    this.propertyForm.value.lat = this.locationInfo.lat;
    this.propertyForm.value.lng = this.locationInfo.lng;
    //subscribe para añadir la propiedad
    this._propiedadService.addPropiedad(this.propertyForm.value).subscribe(
      result => {
        this.propiedad = this.propertyForm.value;
        //si no hay imágenes vamos hacia la pestaña de la lista
        if (this.filesToUpload.length == 0) {
          this._router.navigate(['admin/dashboard/listPropertys']);
        } else {
          //llamamos a un get de todas las propiedades
          this.getProductos();
        }
      },
      error => {
        console.log(<any>error);
      }
    );
  }

  getProductos() {
    //llamamos a todas las propiedades
    this._propiedadService.getOwned().subscribe(
      result => {
        this.propiedades = result;
        //creamos un contador para recorrerlas
        let contador = 0;
        //recorremos las propiedades en busca del último id (ya que este es el que necesitamos para enlazar con las imágenes)
        this.propiedades.forEach(element => {
          contador++;
          //si es el último id y las imágenes no están vacías pasamos a una variable ese id y lo agregamos a img de tipo imágenes
          if (this.propiedades.length == contador && this.filesToUpload != null) {
            this.idPropiedades = element.id;

            for (let i = 0; i < this.filesToUpload.length; i++) {
              if (this.destacada) {
                if (i < (this.filesToUpload.length - 1)) {
                  var json = JSON.stringify(this.filesToUpload[i]);
                  this.img = new Imagenes(null, json, 0, this.idPropiedades);
                  this.guardarImagen();
                } else if (i == (this.filesToUpload.length - 1)) {
                  var json = JSON.stringify(this.filesToUpload[i]);
                  this.img = new Imagenes(null, json, 1, this.idPropiedades);
                  this.guardarImagen();
                }
              } else {
                var json = JSON.stringify(this.filesToUpload[i]);
                this.img = new Imagenes(null, json, 0, this.idPropiedades);
                this.guardarImagen();
              }
            }
          }
        });
      },
      error => {
        console.log(<any>error);
      }
    );
  }

  guardarImagen() {
    //Subscribe que añade la imagen a la tabla de imágenes con el id de la propiedad
    this._propiedadService.addimagenes(this.img).subscribe(
      result => {
        this._router.navigate(['admin/dashboard/listPropertys']);
      },
      error => {
        console.log(<any>error);
      }
    );
  }

  cambiarBarrios() {
    var ciudad = <HTMLInputElement>document.getElementById("ciudad");
    if (ciudad.value == 'Barcelona') {
      this.barrios = ['Centro Ciudad', 'Alta Diagonal', 'Paseo de Gracia', 'Ciutat Vella', '22@', 'Extrarradio'];
      this.propertyForm.get('barrio').setValue('Centro Ciudad');
    } else if (ciudad.value == 'Madrid') {
      this.barrios = ['Salamanca', 'Retiro', 'Chamberi', 'Moncloa', 'Chamartin', 'Cuzco-Cuatro Torres', 'Azca', 'Centro', 'Atocha', 'A1', 'A2', 'A6', 'Periferia'];
      this.propertyForm.get('barrio').setValue('Salamanca');
    } else if (ciudad.value == 'Oviedo') {
      this.barrios = ['Oviedo'];
      this.propertyForm.get('barrio').setValue('Oviedo');
    } else if (ciudad.value == 'Malaga') {
      this.barrios = ['Malaga'];
      this.propertyForm.get('barrio').setValue('Malaga');
    } else if (ciudad.value == 'Valencia') {
      this.barrios = ['Valencia'];
      this.propertyForm.get('barrio').setValue('Valencia');
    } else if (ciudad.value == 'Sevilla') {
      this.barrios = ['Sevilla'];
      this.propertyForm.get('barrio').setValue('Sevilla');
    } else if (ciudad.value == 'Bilbao') {
      this.barrios = ['Bilbao'];
      this.propertyForm.get('barrio').setValue('Bilbao');
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
      //this.propertyForm.get('precio_oficina_fija').setValue('');
    } else {
      this.fija = false;
      //this.propertyForm.get('precio_oficina_fija').setValue(0);
    }
  }

  public datosFlexible() {
    if (this.flexible == false) {
      this.flexible = true;
      //this.propertyForm.get('precio_puesto_flexible').setValue('');
    } else {
      this.flexible = false;
      //this.propertyForm.get('precio_puesto_flexible').setValue(0);
    }
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
