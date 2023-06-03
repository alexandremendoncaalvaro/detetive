function matar () {
    if (participanteAlvo == numeroDetetive) {
        etapaJogo = "preso"
        finalizar()
        while (true) {
            basic.showLeds(`
                . # . # .
                # # # # #
                . # . # .
                # # # # #
                . # . # .
                `)
            basic.showLeds(`
                . . . . .
                . . . . .
                . . . . .
                . . . . .
                . . . . .
                `)
        }
    } else {
        assassinatos += 1
        radio.sendValue("morte", participanteAlvo)
        ocorrerAssassinato(participanteAlvo)
        if (assassinatos >= numeroTotalParticipantes - 2) {
            vencer(meuNumero)
        } else {
            iniciarJogo()
        }
    }
}
function receberMensagem (mensagem: string) {
    parametros = mensagem.split(":")
    numeroTotalParticipantes = parseFloat(parametros[1])
    numeroAssassino = parseFloat(parametros[2])
    numeroDetetive = parseFloat(parametros[3])
    atribuirNumero(parseFloat(parametros[4]))
}
function desenharParticipantes (num: number) {
    linha = 0
    coluna = 0
    for (let index = 0; index < num; index++) {
        led.plot(coluna, linha)
        coluna += 1
        if (coluna > 4) {
            coluna = 0
            linha += 1
        }
    }
}
function sortearPapeis () {
    numeroDetetive = randint(1, numeroTotalParticipantes)
    numeroAssassino = randint(1, numeroTotalParticipantes)
    while (numeroAssassino == numeroDetetive) {
        numeroAssassino = randint(1, numeroTotalParticipantes)
    }
}
function finalizar () {
    if (etapaJogo == "jogando") {
        etapaJogo = "fim"
        while (true) {
            basic.showLeds(`
                # # # # #
                # # # # #
                # # # # #
                # # # # #
                # # # # #
                `)
            basic.showLeds(`
                . . . . .
                . . . . .
                . . . . .
                . . . . .
                . . . . .
                `)
        }
    }
    radio.sendString("fim")
}
function atribuirNumeroServidor () {
    listaSerial.push(control.deviceSerialNumber())
    atribuirNumero(listaSerial.indexOf(control.deviceSerialNumber()) + 1)
    iniciarJogo()
    radio.sendString("jogar")
}
function enviarNumeroSolicitado () {
    if (-1 >= listaSerial.indexOf(radio.receivedPacket(RadioPacketProperty.SerialNumber))) {
        listaSerial.push(radio.receivedPacket(RadioPacketProperty.SerialNumber))
    }
    radio.sendValue("serial", radio.receivedPacket(RadioPacketProperty.SerialNumber))
    montarMensagem(listaSerial.indexOf(radio.receivedPacket(RadioPacketProperty.SerialNumber)) + 1)
    radio.sendString(mensagem)
    if (listaSerial.length == numeroTotalParticipantes - 1) {
        atribuirNumeroServidor()
    }
    mostrarFaltantes()
}
input.onButtonPressed(Button.A, function () {
    if (etapaJogo == "configurando") {
        aumentarTotalParticipantes()
    } else if (etapaJogo == "aguardando") {
        solicitarMeuNumero()
    } else if (etapaJogo == "cadastrando") {
        servir()
    } else if (etapaJogo == "jogando") {
        mirarParticipante()
    }
})
function vencer (num: number) {
    etapaJogo = "venceu"
    finalizar()
    while (true) {
        basic.showIcon(IconNames.Heart)
        basic.showNumber(num)
    }
}
function mirarParticipante () {
    participanteAlvo += 1
    while (participanteAlvo == meuNumero || participanteAlvo > numeroTotalParticipantes) {
        if (participanteAlvo == meuNumero) {
            participanteAlvo += 1
        }
        if (participanteAlvo > numeroTotalParticipantes) {
            participanteAlvo = 1
        }
    }
    basic.showNumber(participanteAlvo)
}
function morrer () {
    etapaJogo = "morto"
    while (true) {
        basic.showIcon(IconNames.Ghost)
        basic.showLeds(`
            . . . . .
            . . . . .
            . . . . .
            . . . . .
            . . . . .
            `)
    }
}
function mostrarFaltantes () {
    basic.clearScreen()
    basic.showLeds(`
        . . . . .
        . . . . .
        . . # . .
        . # # # .
        # # # # #
        `)
    desenharParticipantes(numeroTotalParticipantes - listaSerial.length)
}
function mostrarMeuNumero () {
    if (meuNumero == numeroAssassino) {
        basic.showString("A")
    } else if (meuNumero == numeroDetetive) {
        basic.showString("D")
    } else {
        basic.showString("V")
    }
    basic.showNumber(meuNumero)
}
input.onButtonPressed(Button.AB, function () {
    if (etapaJogo == "iniciando") {
        etapaJogo = "configurando"
        basic.showIcon(IconNames.Square)
    } else if (etapaJogo == "aguardando") {
        solicitarMeuNumero()
    } else if (etapaJogo == "cadastrando") {
        servir()
    } else if (etapaJogo == "jogando") {
        mostrarMeuNumero()
        iniciarJogo()
    }
})
radio.onReceivedString(function (receivedString) {
    if (etapaJogo == convertToText(control.deviceSerialNumber())) {
        if (receivedString.charAt(0) == ":") {
            receberMensagem(receivedString)
            basic.showLeds(`
                . # # # .
                # # # # #
                # # # # #
                # # # # #
                . # # # .
                `)
            etapaJogo = "pronto"
        }
    }
    if (receivedString == "aguardar") {
        if (meuNumero == 0) {
            etapaJogo = "aguardando"
            basic.showLeds(`
                . . . . .
                . . # . .
                . # # # .
                . . # . .
                . . . . .
                `)
            solicitarMeuNumero()
        }
    } else if (receivedString == "solicitar") {
        if (etapaJogo == "configurando") {
            enviarNumeroSolicitado()
        } else if (etapaJogo == "cadastrando") {
            enviarNumeroSolicitado()
        }
    } else if (receivedString == "jogar") {
        iniciarJogo()
    } else if (receivedString == "fim") {
        finalizar()
    }
})
input.onButtonPressed(Button.B, function () {
    if (etapaJogo == "configurando") {
        if (numeroTotalParticipantes >= 3) {
            sortearPapeis()
            servir()
            etapaJogo = "cadastrando"
        }
    } else if (etapaJogo == "aguardando") {
        solicitarMeuNumero()
    } else if (etapaJogo == "cadastrando") {
        servir()
    } else if (etapaJogo == "jogando") {
        if (0 < participanteAlvo) {
            if (meuNumero == numeroAssassino) {
                matar()
            } else if (meuNumero == numeroDetetive) {
                prender()
            }
        }
    }
})
radio.onReceivedValue(function (name, value) {
    if (name == "serial") {
        if (value == control.deviceSerialNumber()) {
            etapaJogo = convertToText(control.deviceSerialNumber())
            basic.showArrow(ArrowNames.South)
        }
    } else if (name == "morte") {
        ocorrerAssassinato(value)
        if (value == meuNumero) {
            morrer()
        } else {
            iniciarJogo()
        }
    }
})
function aumentarTotalParticipantes () {
    numeroTotalParticipantes += 1
    if (numeroTotalParticipantes < 3) {
        numeroTotalParticipantes = 3
    }
    if (numeroTotalParticipantes > 10) {
        numeroTotalParticipantes = 3
    }
    basic.clearScreen()
    desenharParticipantes(numeroTotalParticipantes)
}
function servir () {
    radio.sendString("aguardar")
    basic.showIcon(IconNames.SmallSquare)
    basic.showIcon(IconNames.Square)
    mostrarFaltantes()
}
function montarMensagem (numeroAtribuido: number) {
    mensagem = ":" + numeroTotalParticipantes + ":" + numeroAssassino + ":" + numeroDetetive + ":" + numeroAtribuido
}
function solicitarMeuNumero () {
    radio.sendString("solicitar")
    basic.showLeds(`
        . . # . .
        . . # . .
        # # # # #
        . . # . .
        . . # . .
        `)
}
function iniciarJogo () {
    etapaJogo = "jogando"
    participanteAlvo = 0
    for (let index = 0; index < 1; index++) {
        basic.showNumber(meuNumero)
        basic.showLeds(`
            . . . . .
            . . . . .
            . . . . .
            . . . . .
            . . . . .
            `)
    }
}
function prender () {
    if (participanteAlvo != numeroAssassino) {
        etapaJogo = "perdeu"
        finalizar()
        while (true) {
            basic.showLeds(`
                # . . . #
                . # . # .
                . . # . .
                . # . # .
                # . . . #
                `)
            basic.showLeds(`
                . . . . .
                . . . . .
                . . . . .
                . . . . .
                . . . . .
                `)
        }
    } else {
        vencer(meuNumero)
    }
}
function ocorrerAssassinato (num: number) {
    etapaJogo = "assassinato"
    basic.showLeds(`
        . . . . .
        . . . . .
        . . . . .
        . . . . .
        . . # . .
        `)
    basic.showLeds(`
        . . . . .
        . . . . .
        . . . . .
        . . # . .
        . . . . .
        `)
    basic.showLeds(`
        . . . . .
        . . . . .
        . . # . .
        . . . . .
        . . . . .
        `)
    basic.showLeds(`
        . . . . .
        . . # . .
        . . . . .
        . . . . .
        . . . . .
        `)
    basic.showLeds(`
        . . # . .
        . . . . .
        . . . . .
        . . . . .
        . . . . .
        `)
    basic.showLeds(`
        . . . . .
        . . . . .
        . . . . .
        . . . . .
        . . . . .
        `)
    basic.showNumber(num)
    basic.showIcon(IconNames.Skull)
}
function atribuirNumero (num: number) {
    if (meuNumero == 0) {
        meuNumero = num
    }
    mostrarMeuNumero()
}
let mensagem = ""
let coluna = 0
let linha = 0
let parametros: string[] = []
let assassinatos = 0
let listaSerial: number[] = []
let etapaJogo = ""
let meuNumero = 0
let participanteAlvo = 0
let numeroAssassino = 0
let numeroDetetive = 0
let numeroTotalParticipantes = 0
radio.setTransmitSerialNumber(true)
radio.setGroup(42)
numeroTotalParticipantes = 0
numeroDetetive = 0
numeroAssassino = 0
participanteAlvo = 0
meuNumero = 0
etapaJogo = "iniciando"
listaSerial = []
basic.showIcon(IconNames.House)
