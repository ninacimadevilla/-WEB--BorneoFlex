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
    this.compruebaAceptaCookies();
  }
}
