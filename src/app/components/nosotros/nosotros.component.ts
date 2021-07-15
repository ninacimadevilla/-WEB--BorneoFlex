import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nosotros',
  templateUrl: './nosotros.component.html',
  styleUrls: ['./nosotros.component.scss']
})
export class NosotrosComponent implements OnInit {
  clientes: number = 37;
  operaciones: number = 37;
  transacciones: number = 41604;
  inmuebles: number = 4000;
  constructor() { }

  ngOnInit(): void {
    setTimeout(()=> {
      this.contador('clients',this.clientes);
      this.contador('operaciones',this.operaciones);
      this.contador('transacciones',this.transacciones);
      this.contador('inmuebles',this.inmuebles);

    });
  }

  contador(id: string, time: number) {
    const counter: any  = document.getElementById(id);
    const speed = 100;
    const updateCount = () => {
    const target = +time;
    const count = +counter.innerText;
    const inc = target / speed;
    if (count < target) {
    counter.innerText = Math.ceil(count + inc);
    setTimeout(updateCount, 80);
    } else {
    counter.innerText = (target);}};
    updateCount();
  }
}
