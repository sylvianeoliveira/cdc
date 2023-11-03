// Colocar as contas

function CF(t, p){
    return t / (1 - (1 + t)**-p);
}

function metodoNewton(f, df, t, x, y, p){
    let t0 = 0;
    let n = 0;
    while(1){
        t0 = t;
        n++;
        t = t0 - f(t, x, y, p)/df(t, x, y, p);
        if (Math.abs(t - t0) < 1e-4) return [t, n];
    }
}

function fComEntrada(t, x, y, p){
    // t -> taxa de juros
    // p -> numero de parcelas
    // x -> total a prazo

    let b = (1+t)**(p-1);
    let c = (1+t)**p;
    return y * t * b - (x/p) * (c - 1);
}

function dfComEntrada(t, x, y, p){
    // t -> taxa de juros
    // p -> numero de parcelas
    // x -> total a prazo

    let a = (1+t)**(p-2);
    let b = (1+t)**(p-1);
    return y * (b + t * (p-1) * a) - x * b;
}

function fSemEntrada(t, x, y, p){
    // t -> taxa de juros
    // p -> numero de parcelas
    // x -> total a prazo

    let a = (1+t)**-p;
    return y*t - x/p*(1-a);
}

function dfSemEntrada(t, x, y, p){
    // t -> taxa de juros
    // p -> numero de parcelas
    // x -> total a prazo

    let b = (1+t)**(-p-1);
    return y - x*b;
}

function getInterest(x, y, p){
    let t0 = x/y;
    // if ($("#idp").is(":checked")){ // com entrada
    if (0){ // com entrada
        return metodoNewton(fComEntrada, dfComEntrada, t0, x, y, p);
    }
    else{           // sem entrada
        return metodoNewton(fSemEntrada, dfSemEntrada, t0, x, y, p);
    }

}