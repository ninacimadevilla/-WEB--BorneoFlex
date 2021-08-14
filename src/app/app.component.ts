import { Component, OnInit } from "@angular/core";
import { CookieService } from "ngx-cookie-service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'borneoflex';
  public cookies:boolean=false
  
  constructor(private cookieSvc: CookieService) {}

  compruebaAceptaCookies(){
    if(this.cookies==false && localStorage.getItem('cookies')=='true'){
      this.cookies=true;
    }else if(localStorage.getItem('cookies')=='false'){
      this.cookies=false;
    }
  }

  cerrarBannerCookies(){
    this.cookieSvc.set('borneoflex.es', 'Politica de cookies de borneoflex');
    this.cookieSvc.get('borneoflex.es');
    localStorage.setItem('cookies','true');
    this.compruebaAceptaCookies();
  }

  ngOnInit() {
    //this.compruebaAceptaCookies();
    let localWindow: any = window;
    localWindow.CookieConsent.init({
      modalMainTextMoreLink:  'https://borneoflex.es/politicaCookies',
      barTimeout: 0,
      theme: {
          barColor: '#004E59',
          barTextColor: '#FFF',
          barMainButtonColor: '#FFF',
          barMainButtonTextColor: '#004E59',
          modalMainButtonColor: '#4285F4',
          modalMainButtonTextColor: '#FFF',
      },
      language: {
          current: 'es',
          locale: {
              es: {
                  barMainText: 'BORNEO FLEX utiliza cookies propias y de terceros para analizar nuestros servicios y mostrarte publicidad relacionada con tus preferencias, en base a un perfil elaborado a partir de tus hábitos de navegación. (Por ejemplo, páginas visitadas). Puedes obtener más información y configurar tus preferencias',
                  barLinkSetting: 'Configuración de Cookies',
                  barBtnAcceptAll: 'Aceptar cookies',
                  modalMainTitle: 'Legal',
                  modalMainText: 'Usamos cookies propias y de terceros para recopilar información que ayude a mejorar su visita a sus páginas web. Las cookies no se utilizarán para recopilar información personal. Puede permitir o rechazar su uso, también puede cambiar su configuración cuando lo desee.',
                  modalBtnSave: 'Guardar configuración',
                  modalBtnAcceptAll: 'Aceptar todo y cerrar',
                  modalAffectedSolutions: 'Acerca de las cookies:',
                  learnMore: 'Aprender más',
                  on: 'Activado',
                  off: 'Desactivado',
              }
          }
      },
      categories: {
          necessary: {
              needed: true,
              wanted: true,
              checked: true,
              language: {
                  locale: {
                      es: {
                          name: 'Necesarias',
                          description: 'Las cookies necesarias ayudan a que un sitio web sea utilizable al habilitar funciones básicas como la navegación de páginas y el acceso a áreas seguras del sitio web. El sitio web no puede funcionar correctamente sin estas cookies.',
                      },
                  }
              }
          },
          spam: {
              needed: false,
              wanted: false,
              checked: false,
              language: {
                  locale: {
                      es: {
                          name: 'Publicitarias',
                          description: 'Son aquellas que almacenan información del comportamiento de los usuarios obtenida a través de la observación continuada de sus hábitos de navegación, lo que permite desarrollar un perfil específico para mostrar publicidad en función del mismo.',
                      },
                  }
              }
          },
      }
  });
  }
}
