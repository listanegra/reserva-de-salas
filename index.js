class Usuario {

    constructor(email, endereco, complemento, cep, cidade, estado, root) {
        this.email = email;
        this.endereco = endereco;
        this.complemento = complemento;
        this.cep = cep;
        this.cidade = cidade;
        this.estado = estado;
        this.root = root;
    }

}

class Reserva {

    constructor(horaInicio, horaFinal) {
        this.horaInicio = horaInicio;
        this.horaFinal = horaFinal;
    }

    set data(data) {
        this.moment = moment.range(moment(`${data} ${this.horaInicio}`, 'DD/MM/YYYY HH:mm').toDate(), moment(`${data} ${this.horaFinal}`, 'DD/MM/YYYY HH:mm').toDate());
    }

    set usuario(usuario) {
        this._usuario = usuario;
    }

    get usuario() {
        return this._usuario;
    }

    podeReservar(reserva) {
        return this.moment.overlaps(reserva.moment);
    }

}

class Sala {

    constructor(bloco, piso, descricao) {
        this.bloco = bloco;
        this.piso = piso;
        this.descricao = descricao;
        this._reservas = [];
    }

    get reservas() {
        return this._reservas;
    }

    addReserva(reserva) {
        this._reservas.push(reserva);
    }

    removerReserva(reserva) {
        this._reservas = this._reservas.slice(this._reservas.indexOf(reserva), 1);
    }

    verificarReserva(reserva) {
        return !this._reservas.length || !this._reservas.find(e => e.podeReservar(reserva));
    }

    novaReserva(reserva) {
        if (this.verificarReserva(reserva)) {
            this.addReserva(reserva);
            return 'Horário reservado com sucesso';
        }
        return 'Data/Horário já reservado!';
    }

}

window['moment-range'].extendMoment(moment);
var drawer = $('div.bmd-layout-container.bmd-drawer-f-l');
window.updateDrawer = () => window.innerWidth < 720 ? drawer.addClass('bmd-drawer-overlay') : drawer.removeClass('bmd-drawer-overlay');
$(window).on('resize', window.updateDrawer);

var app = angular.module("app", ["ngRoute"]).config(($routeProvider) => {
    $routeProvider.when('/', {
        templateUrl: './templates/login.html',
        controller: "Main"
    }).when('/home', {
        templateUrl: './templates/home.html',
        controller: 'Home'
    }).when('/cadastro', {
        templateUrl: './templates/cadastro.html',
        controller: 'Cadastro'
    }).when('/suasReservas', {
        templateUrl: './templates/suasReservas.html',
        controller: 'suasReservas'
    }).when('/salas', {
        templateUrl: './templates/mapa.html',
        controller: 'Mapa'
    }).otherwise('/');
});

app.controller('Main', function($scope, $rootScope, $location) {
    $scope.fecharDrawer = () => {
        if (window.innerWidth >= 720) {
            $('#ocultar').removeClass('bmd-layout-container.bmd-drawer-f-l bmd-drawer-in');
            $('#ocultar').addClass('bmd-layout-container.bmd-drawer-f-l');
        }
    }

    $rootScope.usuarios = {
        'admin': new Usuario('admin@admin.com', 'Casa da esquina', 'Fundo', '84000-000', 'Milharal Ponta Grossa', 'PR', true)
    };

    $scope.$on('$viewContentLoaded', () => {
        $('body').bootstrapMaterialDesign();
        window.updateDrawer();
    });

    $scope.doLogin = (usuario) => {
        if ($rootScope.usuarios[usuario]) {
            $location.path('/home');
        } else {
            $.snackbar({ content: "Usuário/Senha inválidos" });
        }
    }
    $scope.isLoginScreen = () => $location.path() == '/';

    $scope.checkUsuario = (usuario) => {
        return $rootScope.usuarios[usuario] && $rootScope.usuarios[usuario].root;
    }
});

app.controller('Home', function($scope, $rootScope, $location) {

});

app.controller('Cadastro', function($scope, $rootScope, $location) {
    $scope.usuario = {};

    $scope.cadastrar = () => {
        $rootScope.usuarios[$scope.usuario.nome] = Object.assign(new Usuario(), $scope.usuario);
    };

    $scope.excluirUsuario = (usuario) => delete $rootScope.usuarios[usuario];
    $scope.alterarUsuario = (usuario) => Object.assign($scope.usuario, $rootScope.usuarios[usuario]);
});

app.controller('suasReservas', function($scope, $rootScope, $location) {
    $scope.removerReserva = (sala, reserva) => {
        $rootScope.removerReserva(sala, reserva);
        $(`tr#${sala}`).remove();
    };
});

app.controller('Mapa', function($scope, $rootScope, $location) {
    $('[data-toggle="datepicker"]').datepicker({
        autoPick: true,
        format: 'dd/mm/yyyy',
        startDate: '0d',
        autoHide: true,
        daysMin: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
        months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    });

    const card_descricao = $('div#card_descricao');
    card_descricao.toggle();

    $scope.andar_atual = 1;
    $scope.sala_selecionada = {};
    $scope.salas = [...$('rect.sala[id][ng-click]')].map(e => e.id);
    $scope.mapa_salas = {
        'Mini Auditorio': new Sala('C', "térreo", 'Mini Auditório'),
        'Auditorio': new Sala('C', "térreo", 'Auditório'),
        'C102': new Sala('C', "térreo", 'Laboratório de Informática'),
        'C103': new Sala('C', "térreo", 'Laboratório de Informática'),
        'C104': new Sala('C', "térreo", 'Laboratório de Informática'),
        'C105': new Sala('C', "térreo", 'Sala de Xadrez'),
        'C106': new Sala('C', "térreo", 'Laboratório Interdisciplinar'),
        'C107': new Sala('C', "térreo", 'Laboratório de Computação Aplicada'),
        'C108': new Sala('C', "térreo", 'Sala de Aula Teórica'),
        'C110': new Sala('C', "térreo", 'Laboratório Eletrônica'),
        'C113': new Sala('C', "térreo", 'Laboratório Química B'),
        'C114': new Sala('C', "térreo", 'Laboratório Química A'),
        'C201': new Sala('C', "superior", 'Laboratório de Informática I'),
        'C202': new Sala('C', "superior", 'Laboratório de Informática III'),
        'C203': new Sala('C', "superior", 'Laboratório de Informática V'),
        'C207': new Sala('C', "superior", 'Laboratório de Manutenção'),
        'C208': new Sala('C', "superior", 'Laboratório de Informática IV'),
        'C209': new Sala('C', "superior", 'Calem Línguas I'),
        'C210': new Sala('C', "superior", 'Calem Línguas II'),
        'C212': new Sala('C', "superior", 'Calem Línguas III'),
    }

    $scope.horarios = {
        'M1': new Reserva('07h30', '08h20'),
        'M2': new Reserva('08h20', '09h10'),
        'M3': new Reserva('09h10', '10h00'),
        'M4': new Reserva('10h20', '11h10'),
        'M5': new Reserva('11h10', '12h00'),
        'M6': new Reserva('12h00', '12h50'),
        'T1': new Reserva('13h00', '13h50'),
        'T2': new Reserva('13h50', '14h40'),
        'T3': new Reserva('14h40', '15h30'),
        'T4': new Reserva('15h50', '16h40'),
        'T5': new Reserva('16h40', '17h30'),
        'T6': new Reserva('17h30', '18h20'),
        'N1': new Reserva('18h40', '19h30'),
        'N2': new Reserva('19h30', '20h20'),
        'N3': new Reserva('20h20', '21h10'),
        'N4': new Reserva('21h20', '22h10'),
        'N5': new Reserva('22h10', '23h00')
    };

    $rootScope.buscarReservas = (usuario) => {
        let reservas = [];
        for (let sala of Object.keys($scope.mapa_salas)) {
            let found = $scope.mapa_salas[sala].reservas.find(e => e.usuario == $rootScope.usuarios[usuario]);
            if (found) reservas.push({ sala: sala, reserva: found });
        }
        return reservas;
    }

    $rootScope.removerReserva = (sala, reserva) => {
        //$scope.mapa_salas[sala].removerReserva(reserva);
    };

    $scope.reservarSala = (sala) => {
        let reserva = new Reserva($('#horaInicioReserva').val(), $('#horaFinalReserva').val());
        reserva.data = $('[data-toggle="datepicker"]').val();
        reserva.usuario = $rootScope.usuarios[$rootScope.usuario];
        
        var texto = $scope.mapa_salas[sala].novaReserva(reserva);
        $.snackbar({ content: texto });

        card_descricao.fadeToggle("slow", "linear");
        $scope.mostrarDetalhes($scope.sala_selecionada.nome);
        card_descricao.fadeToggle("slow", "linear");
    };

    $scope.mostrarDetalhes = (sala) => {
        setTimeout(() => {
            $scope.$apply(() => {
                for (let reserva of Object.keys($scope.horarios)) {
                    $scope.horarios[reserva].data = $('[data-toggle="datepicker"]').val();
                }
            });
        }, 100);
        
        
        if ($scope.sala_selecionada.nome != sala || card_descricao.is(":hidden")) {
            if (card_descricao.is(":visible")) card_descricao.fadeToggle(100);
            $scope.sala_selecionada.nome = sala;
            $scope.sala_selecionada.dados = $scope.mapa_salas[sala];
            card_descricao.fadeToggle("slow", "linear");
        }
    };

    $scope.ocultarDetalhes = () => {
        if (card_descricao.is(":visible")) card_descricao.fadeToggle("slow", "linear");
    };

    $scope.mudarAndar = (andar) => {
        $scope.andar_atual = andar;
    };

    document.getElementById('dataReserva').addEventListener('focusout', () => {
        card_descricao.fadeToggle("slow", "linear");
        $scope.mostrarDetalhes($scope.sala_selecionada.nome);
        card_descricao.fadeToggle("slow", "linear");
    });

    var seleciona = document.getElementById('horaInicioReserva').addEventListener('change', selecionarHorarioFinal);

    function selecionarHorarioFinal() {

        var horario = document.getElementById('horaInicioReserva').value;
        var horariosInicial = ['07:30', '08:20', '09:10', '10:20', '11:10', '12:00', '13:00', '13:50', '14:40', '15:50', '16:40', '17:30', '18:40', '19:30', '20:20', '21:20', '22:10'];
        var horariosFinal = ['08:20', '09:10', '10:00', '11:10', '12:00', '12:50', '13:50', '14:40', '15:30', '16:40', '17:30', '18:20', '19:30', '20:20', '21:10', '22:10', '23:00'];
        var options = '<option selected>Horario Final</option>';

        if (horario == "Horario Inicial") {
            options = '<option selected>Horario Final</option>';
            $("#horaFinalReserva").html(options);
            return;
        }
        for (j = 0; j < horariosFinal.length; j++) {
            if (horario == horariosInicial[j]) {
                for (i = j; i < horariosFinal.length; i++) {
                    options += '<option value="' + horariosFinal[i] + '">' + horariosFinal[i] + '</option>';
                }
                $("#horaFinalReserva").html(options);
                break;
            }
        }
    }
});