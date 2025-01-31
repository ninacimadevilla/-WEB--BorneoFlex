import { Component, OnInit, ViewChild, TemplateRef, ElementRef, NgZone } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { PropiedadService } from '../../services/propiedad.service';
import { Owned } from '../../models/owned';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormControl } from "@angular/forms";
import { Imagenes } from 'src/app/models/images';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { MapsAPILoader } from '@agm/core';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.scss'],
  providers: [PropiedadService]
})
export class InicioComponent implements OnInit {
  public propiedades: Array<Owned>;
  public propiedadesFiltradas: Array<Owned> = [];
  public selected: FormControl = new FormControl(null);
  public opc: any;
  public ciudad;
  public page: number = 1;
  public contador;
  public contadorSalamanca = 0;
  public contadorAtocha = 0;
  public contadorExtrarradio = 0;
  public contador22 = 0;
  public contadorMadrid = 0;
  public contadorBarcelona = 0;
  public contadorValencia = 0;
  public contadorBilbao = 0;
  public contadorMalaga = 0;
  public contadorSevilla = 0;

  public images: Array<Imagenes>;
  public imagenesFiltradas: Array<Imagenes> = [];
  public id;
  public contadorImagenes = 0;
  public urlImage;
  public contador1=0;

  constructor(private toastr: ToastrService, private _route: ActivatedRoute, private _router: Router,
    private _propiedadService: PropiedadService, private modal: NgbModal, config: NgbCarouselConfig) {
    config.interval = 4000;
    config.wrap = true;
    config.keyboard = false;
    config.pauseOnHover = false;
  }

  ngOnInit(): void {
    this.selected.valueChanges.subscribe(changes => {
      this.Opciones(changes);
    });
    this.getOwned();
  }

  searchAction() {
    this._router.navigate(['/view/list', this.opc]);
  }

  buscar() {
    this._router.navigate(['/view/list', "Madrid"]);
  }

  buscarBarcelona() {
    this._router.navigate(['/view/list', "Barcelona"]);
  }

  /*buscarBilbao() {
    this._router.navigate(['/view/list', "Bilbao"]);
  }

  buscarOviedo() {
    this._router.navigate(['/view/list', "Oviedo"]);
  }

  buscarMalaga() {
    this._router.navigate(['/view/list', "Malaga"]);
  }

  buscarValencia() {
    this._router.navigate(['/view/list', "Valencia"]);
  }*/

  /*buscarSevilla() {
    this._router.navigate(['/view/list', "Sevilla"]);
  }*/



  Opciones(opc1) {
    this.opc = opc1;
  }

  getOwned() {
    this.contador = 0;
    this._propiedadService.getOwned().subscribe(
      result => {
        this.propiedades = result;
        this.propiedades.forEach(element => {
          if (element.ciudad == "Madrid") {
            this.contadorMadrid++;
            if (element.barrio == "Salamanca") {
              this.contadorSalamanca++;
            } else if (element.barrio == "Atocha") {
              this.contadorAtocha++;
            }
          } else if (element.ciudad == "Barcelona") {
            this.contadorBarcelona++;
            if (element.barrio == "Extrarradio") {
              this.contadorExtrarradio++;
            } if (element.barrio == "22@") {
              this.contador22++;
            }
          } else if (element.ciudad == "Valencia") {
            this.contadorValencia++;
          } else if (element.ciudad == "Bilbao") {
            this.contadorBilbao++;
          } else if (element.ciudad == "Malaga") {
            this.contadorMalaga++;
          } else if (element.ciudad == "Sevilla") {
            this.contadorSevilla++;
          }

          if (this.contador < 3) {
            this.id = element.id;
            this.propiedadesFiltradas[this.contador] = element;
            this.setImg(element.id, element);
          }

          this.contador++;
        });
      },
      error => {
        console.log(<any>error);
      }
    );
  }

  setImg(id, element: Owned) {
    let urlDefault: string = 'assets/images/view/office3.png';
    this._propiedadService.listarimagenes(id).subscribe(
      response => {
        if (response) {
          if (response.length === 0) {
            element.imgUrl = urlDefault;
          } else {
            for(let i=0; i<response.length; i++){
              if(response[i].destacado!=1){
                this.contador1++;
              }else if(response[i].destacado==1){
                break;
              }
            }

            if(this.contador1==response.length && response[this.contador1].destacado!=1){
              element.imgUrl = urlDefault;
            }else{
              element.imgUrl = 'http://borneoflex.es/borneo/uploads/' + response[this.contador1].imagen.replace('[', '').replace(']', '').replace('"', '').replace('"', '');
            }
            // Revisar porque la imagen viene en este formato: ["imgurl"]
          }
          this.contador1=0;
        }
        
      },
      error => {
        console.log(<any>error);
      }
    )

    element.imgUrl = urlDefault;
  }


}
