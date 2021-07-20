import { Component, NgZone, OnInit } from '@angular/core';
import { Owned } from '../../../models/owned';
import { PropiedadService } from '../../../services/propiedad.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Imagenes } from '../../../models/images';

@Component({
  selector: 'app-single',
  templateUrl: './single.component.html',
  styleUrls: ['./single.component.scss'],
  providers: [PropiedadService]
})


export class SingleComponent implements OnInit {
  public propiedad: Owned;
  public propiedades: Array<Owned>;
  public propiedadesFiltradas: Array<Owned> = [];
  public id;
  public images: Array<Imagenes>;
  public contador = 0;
  showMaps: boolean;
  public mapTypeId: string= 'roadmap';
  public markers: any[] = [];
  map: google.maps.Map;
  public lat: number;
  public lng: number;
  public zoom: number = 17;
  public urlImage="default";
  mapClickListener: google.maps.MapsEventListener;
  
  styles = [
    
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [
        { visibility: "off" }
      ]
    },
   
  ];
  constructor(private _route: ActivatedRoute, private _router: Router, private _propiedadService: PropiedadService, private zone: NgZone) {
  }

  recogerDato() {
    this._propiedadService.getPropiedad(this.id).subscribe(
      response => {
        this.propiedad = response;
        this.lat = parseFloat(this.propiedad[0].lat);
        this.lng = parseFloat(this.propiedad[0].lng);
        this.markers.push({
          position: {
            lat: this.lat,
            lng: this.lng
          },
          label: ''
        });
      
        this.showMaps = true;
      }, error => {
        console.log(<any>error);
      }
    );
  }
  public mapReadyHandler(map: google.maps.Map): void {
    this.map = map;
    this.mapClickListener = this.map.addListener('click', (e: google.maps.MouseEvent) => {
      this.zone.run(() => {
      });
    });
  }
  listarImagenes() {
    this._propiedadService.listarimagenes(this.id).subscribe(
      response => {
        this.images = response;
        this.images.forEach(element => {
          element.imagen = element.imagen.slice(2, -2);
          if(element.destacado==1){
            this.urlImage='http://borneoflex.es/borneo/uploads/' +element.imagen;
          }
        });
      }, error => {
        console.log(<any>error);
      }
    );
  }

  getOwned() {
    this.contador = 0;
    this._propiedadService.getOwned().subscribe(
      result => {
        this.propiedades = result;
        this.propiedades.forEach(element => {

          if (this.contador < 3) {
            this.propiedadesFiltradas[this.contador] = element;
          }
          this.contador++;
        });

      },
      error => {
        console.log(<any>error);
      }
    );
  }

  scroll(el: HTMLElement){
    el.scrollIntoView();
  }

  ngOnInit() {
    this.id = this._route.snapshot.params['id'];
    this.recogerDato();
    this.listarImagenes();
    this.getOwned();
  }
}
