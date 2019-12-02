class Reserva {

    constructor(data, horaInicio, horaFinal) {
        this.moment = moment.range(moment(`${data} ${horaInicio}`, 'DD/MM/YYYY HH:mm').toDate(), moment(`${data} ${horaFinal}`, 'DD/MM/YYYY HH:mm').toDate());
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
        this.reservas = [];
    }

    addReserva(reserva) {
        this.reservas.push(reserva);
    }

    verificarReserva(reserva) {
        if (!this.reservas.length || !this.reservas.find(e => e.podeReservar(reserva))) {
            return 'Disponivel';
        }
        return 'Reservado';
    }

    novaReserva(reserva) {
        if (!this.reservas.length || !this.reservas.find(e => e.podeReservar(reserva))) {
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
    }).when('/alterarCadastro', {
        templateUrl: './templates/alterarCadastro.html',
        controller: 'alterarCadastro'
    }).when('/suasReservas', {
        templateUrl: './templates/suasReservas.html',
        controller: 'suasReservas'
    }).when('/salas', {
        templateUrl: './templates/mapa.html',
        controller: 'Mapa'
    }).otherwise('/');
});

app.controller('Main', function($scope, $rootScope, $location) {
    $rootScope.usuarios = {
        'admin': { permissions: 'root' },
        'Guilherme': { permissions: 'root' }
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
        return $rootScope.usuarios[usuario] && $rootScope.usuarios[usuario].permissions == 'root';
    }
});

app.controller('Home', function($scope, $rootScope, $location) {

});

app.controller('Cadastro', function($scope, $rootScope, $location) {
    $scope.cadastrar = () => {

    }
});

app.controller('alterarCadastro', function($scope, $rootScope, $location) {

});

app.controller('suasReservas', function($scope, $rootScope, $location) {

});

app.controller('Mapa', function($scope, $rootScope, $location) {
    $('[data-toggle="datepicker"]').datepicker({
        autoPick: true,
        format: 'dd/mm/yyyy',
        startDate: '+0d',
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

    $scope.reservarSala = (sala) => {
        let reserva = new Reserva($('[data-toggle="datepicker"]').val(), $('#horaInicioReserva').val(), $('#horaFinalReserva').val());
        var texto = ($scope.mapa_salas[sala].novaReserva(reserva));
        $.snackbar({ content: texto });
        card_descricao.fadeToggle("slow", "linear");
        $scope.mostrarDetalhes($scope.sala_selecionada.nome);
        card_descricao.fadeToggle("slow", "linear");
    }

    $scope.mostrarDetalhes = (sala) => {
        var codigo = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'N1', 'N2', 'N3', 'N4', 'N5'];
        var horariosInicial = ['07h30', '08h20', '09h10', '10h20', '11h10', '12h00', '13h00', '13h50', '14h40', '15h50', '16h40', '17h30', '18h40', '19h30', '20h20', '21h20', '22h10'];
        var horariosFinal = ['08h20', '09h10', '10h00', '11h10', '12h00', '12h50', '13h50', '14h40', '15h30', '16h40', '17h30', '18h20', '19h30', '20h20', '21h10', '22h10', '23h00'];
        var table = '';
        for (i = 0; i < 17; i++) {
            let reserva = new Reserva($('[data-toggle="datepicker"]').val(), horariosInicial[i], horariosFinal[i]);
            var texto = ($scope.mapa_salas[sala].verificarReserva(reserva));
            table += '<tr><th>' + codigo[i] + '</th><td>' + horariosInicial[i] + '</td><td>' + horariosFinal[i] + '</td><td>' + texto + '</td></tr>';
        }
        $("#tabelaHorario").html(table);

        if ($scope.sala_selecionada.nome != sala || card_descricao.is(":hidden")) {
            if (card_descricao.is(":visible")) card_descricao.fadeToggle(100);
            $scope.sala_selecionada.nome = sala;
            $scope.sala_selecionada.dados = $scope.mapa_salas[sala];
            card_descricao.fadeToggle("slow", "linear");
        }
    }

    $scope.ocultarDetalhes = () => {
        if (card_descricao.is(":visible")) card_descricao.fadeToggle("slow", "linear");
    }

    $scope.mudarAndar = (andar) => {
        $scope.andar_atual = andar;
    }

    var atualiza = document.getElementById('dataReserva').addEventListener('focusout', atualizaHorario);

    function atualizaHorario() {
        card_descricao.fadeToggle("slow", "linear");
        setTimeout(() => { $scope.mostrarDetalhes($scope.sala_selecionada.nome); }, 500);
        card_descricao.fadeToggle("slow", "linear");
    }

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