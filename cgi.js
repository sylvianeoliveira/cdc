let table = [];
// Fazer as coisas
$("#submitButton").click(function ( event ) {
    // Impedir o envio do formulário padrão
    event.preventDefault();

    var numParcelas = $("#parc").val();
    var taxaJuros = $("#itax").val() / 100; 
    var valorFinanciado = $("#ipv").val() / 1;
    var valorFinal = $("#ipp").val();
    var valorVoltar = $("#ipb").val();
    var mesesVoltar = $("#ipm").val();

    var entrada = $("#idp").is(":checked");
    var imprime = $("#iip").is(":checked");
    
    //Tratamento de entrada
    var errorMessage = "";
    if (taxaJuros == 0 && valorFinal == 0) {
        errorMessage +=
        "<p>Taxa de juros e valor final não podem ser ambos nulos.</p>";
    }
    if (taxaJuros == 0 && valorFinanciado == 0) {
        errorMessage +=
        "<p>Taxa de juros e valor financiado não podem ser ambos nulos.</p>";
    }
    if (valorFinanciado == 0 && valorFinal == 0) {
        errorMessage +=
        "<p>Valor financiado e valor final não podem ser ambos nulos.</p>";
    }
    if (numParcelas < 0 || taxaJuros < 0 || valorFinanciado < 0 || valorFinal < 0 || valorVoltar < 0 || mesesVoltar < 0){
        errorMessage +=
        "<p>Nenhum valor de entrada pode ser negativo.</p>";
    }

    if (mesesVoltar > numParcelas) {
        errorMessage +=
        "<p>Meses a voltar não pode ser maior do que o número de parcelas.</p>";
    }    
    if (errorMessage != "") {
        $("#errorMessage").html(errorMessage);
        $("#errorMessage").show();
        $("#successMessage").hide();
        event.preventDefault();
    } else {
        $("#successMessage").show();
        $("#errorMessage").hide();
        $("#cdcfieldset").hide();
        $("#back").show();
        $("#infoTable").html(infoTable(numParcelas, taxaJuros, valorFinanciado, valorFinal, valorVoltar, mesesVoltar, entrada));
        $("#infoTable").show();
        $("#priceTable").html(priceTable(numParcelas, valorFinanciado, valorFinal, taxaJuros));
        $("#priceTable").show();
        $("#resultTable").html(resultTable(numParcelas, taxaJuros, valorFinanciado, valorFinal, valorVoltar, mesesVoltar));
        $("#resultTable").show();
        if(imprime) window.print();
    }
});

function priceTable(numParcelas, valorFinanciado, valorFinal, taxaJuros){
    let jurosTotal = 0;
    let numIte = 0;
    if (taxaJuros == 0){
        [taxaJuros, numIte] = getInterest(valorFinal, valorFinanciado, numParcelas);
    }
    let pagMensal = (CF(taxaJuros, numParcelas).toFixed(6) * valorFinanciado).toFixed(2);

    for (let i = 0; i <= numParcelas; i++) {
        table[i] = [0, 0, 0, 0, 0];
    }


    table[0][0] = 0;
    if ($("#idp").is(":checked")){
        pagMensal = (CF(taxaJuros, numParcelas-1).toFixed(6) * valorFinanciado).toFixed(2);
        table[0][1] = pagMensal;
        numParcelas--;
        table[0][4] = valorFinanciado - pagMensal;
    }
    else{
        table[0][1] = 0.0;
        table[0][4] = valorFinanciado;
    }
    table[0][2] = `(${taxaJuros})`;
    table[0][3] = 0.0;

    for (let i = 1; i <= numParcelas; i++){
        table[i][0] = i;
        table[i][1] = pagMensal;
        table[i][2] = (table[i-1][4] * taxaJuros).toFixed(3);
        table[i][3] = (pagMensal - table[i][2]).toFixed(2);
        table[i][4] = (table[i-1][4] - table[i][3]).toFixed(2);
        jurosTotal += parseFloat(table[i][2]); 
    }

    var tableTags = `
        <p>Tabela Price</p>
        <table>
        <thead>
            <tr>
                <th>Mês</th>
                <th>Prestação</th>
                <th>Juros</th>
                <th>Amortização</th>
                <th>Saldo Devedor</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>n</td>
                <td>R = pmt</td>
                <td>J = SD * t</td>
                <td>U = pmt - J</td>
                <td>SD = PV - U</td>
            </tr>`;

    for (let i = 0; i <= numParcelas; i++){
        tableTags += "<tr>";
        for(let j = 0; j < 5; j++){
        tableTags += "<td>" + table[i][j] + "</td>";
        }
        tableTags += "</tr>";
    }
    tableTags += `
            <tr>
            <td>Total</td>
            <td> ${(pagMensal*numParcelas).toFixed(2)} </td>
            <td> ${jurosTotal.toFixed(3)} </td>
            <td> ${valorFinanciado.toFixed(2)} </td>
            <td>0.00</td>
            </tr>
        </tbody>
    </table>`;
    return tableTags;
}

function infoTable(numParcelas, taxaJuros, valorFinanciado, valorFinal, valorVoltar, mesesVoltar, entrada){
    let infos = `
    <p>Parcelamento: ${numParcelas} meses</p>
    <p>Taxa: ${(taxaJuros * 100).toFixed(2)}% ao mês = ${(((1+taxaJuros)**12 -1)*100).toFixed(2)}% ao ano</p>
    <p>Valor Financiado: $${valorFinanciado.toFixed(2)}</p>
    <p>Valor Final: $${parseFloat(valorFinal).toFixed(2)}</p>
    <p>Valor a Voltar: $${parseFloat(valorVoltar).toFixed(2)}</p>
    <p>Meses a Voltar: ${mesesVoltar}</p>
    <p>Entrada: ${entrada}</p>
    `;
    return infos;
}

function resultTable(numParcelas, taxaJuros, valorFinanciado, valorFinal, valorVoltar, mesesVoltar){
    let numIte = 0;
    let taxa = 0.0;
    if (taxaJuros == 0){
        [taxaJuros, numIte] = getInterest(valorFinal, valorFinanciado, numParcelas);
        taxa = taxaJuros;
    }
    const cf = CF(taxaJuros, numParcelas).toFixed(6);
    const prestacao = (cf * valorFinanciado.toFixed(2)).toFixed(2);
    
    if (valorVoltar > 0){
        mesesVoltar = Math.ceil(valorVoltar / prestacao);
    }

    return `
    <p>Coefiente de Financiamento: ${cf}</p>
    <p>Prestação: ${cf} * $${valorFinanciado.toFixed(2)} = $${prestacao} ao mês</p>
    <p>Valor Pago: $${(prestacao * numParcelas).toFixed(2)}</p>
    <p>Taxa Real (${numIte} iterações): ${(taxa*100).toFixed(4)}% ao mês</p>
    <p>Valor Corrigido: $${table[numParcelas-mesesVoltar][4]}</p> `;
}

$("#back").click(function () {
    window.location.reload();
});