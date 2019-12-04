class Usuario {

    constructor(email, nome, sobrenome, endereco, complemento, cep, cidade, estado, root) {
        this.email = email;
        this.nome = nome;
        this.sobrenome = sobrenome;
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
        this._reservas.splice(this._reservas.indexOf(reserva), 1);
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

const API_URL = "http://localhost:3000";

window['moment-range'].extendMoment(moment);
var drawer = $('div.bmd-layout-container.bmd-drawer-f-l');
window.updateDrawer = () => window.innerWidth < 720 ? drawer.addClass('bmd-drawer-overlay') : drawer.removeClass('bmd-drawer-overlay');
$(window).on('resize', window.updateDrawer);

function getUsuario(user) {
    let usuario = user['id'];
    delete user.id;
    return { usuario: usuario, objeto: Object.assign(new Usuario(), user) };
}

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

app.controller('Main', function ($scope, $rootScope, $location) {
    $scope.fecharDrawer = () => {
        if (window.innerWidth > 0) {
            drawer.removeClass('bmd-drawer-in');
            $('div.bmd-layout-backdrop').removeClass('in');
        }
    }

    $rootScope.usuarios = {};

    $.get(API_URL + "/usuarios", (data) => {
        for (let user of data) {
            let u = getUsuario(user);
            $rootScope.usuarios[u.usuario] = u.objeto;
        }
    });

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

app.controller('Home', function ($scope, $rootScope, $location) {

});

app.controller('Cadastro', function ($scope, $rootScope, $location) {
    $scope.usuario = {};

    $('#formulario').submit((event) => {
        event.preventDefault();
        if ($rootScope.usuarios[$scope.usuario.user]) {
            $.snackbar({ content: 'Usuário já cadastrado no sistema' });
        } else if ($('#estado').val() == 'Selecione') {
            $.snackbar({ content: 'Selecione um estado' });
        } else {
            if ($rootScope.usuarios[$scope.usuario.id]) {
                $.ajax({
                    type: "PUT",
                    url: `${API_URL}/usuarios/${$scope.usuario.id}`,
                    data: Object.assign(new Usuario(), $scope.usuario)
                }).done(() => $scope.usuario = {});
            } else {
                $.post(API_URL + "/usuarios", Object.assign(new Usuario(), $scope.usuario)).done((data) => {
                    let user = getUsuario(data);
                    $rootScope.usuarios[user.usuario] = user.objeto;
                    $.snackbar({ content: 'Usuário cadastrado com sucesso' });
                });
            }
        }
    })


    $scope.excluirUsuario = (usuario) => {
        $.ajax({
            type: "DELETE",
            url: `${API_URL}/usuarios/${usuario}`,
        }).done(() => {
            delete $rootScope.usuarios[usuario];
            $.snackbar({ content: 'Usuário excluído com sucesso' });
        })
    }

    $scope.alterarUsuario = (usuario) => {
        $scope.usuario.id = usuario;
        Object.assign($scope.usuario, $rootScope.usuarios[usuario]);
    }
});

app.controller('suasReservas', function ($scope, $rootScope, $location) {
    $scope.reservas = [];
    if ($rootScope.mapa_salas) {
        for (let sala of Object.keys($rootScope.mapa_salas)) {
            let found = $rootScope.mapa_salas[sala].reservas.find(e => e.usuario == $rootScope.usuarios[$rootScope.usuario]);
            if (found) $scope.reservas.push({ sala: sala, reserva: found, data: found.moment.start.format('DD/MM/YYYY') });
        }
    }

    $scope.removerReserva = (sala, reserva) => {
        $rootScope.mapa_salas[sala].removerReserva(reserva);
        $scope.reservas.splice($scope.reservas.indexOf($scope.reservas.find(e => e.reserva == reserva)), 1);
        $.snackbar({ content: 'Reserva excluída com sucesso' });
    };
});

app.controller('Mapa', function ($scope, $rootScope, $location) {
    $('[data-toggle="datepicker"]').datepicker({
        autoPick: true,
        format: 'dd/mm/yyyy',
        startDate: '0d',
        autoHide: true,
        daysMin: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
        months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
        filter: (date, view) => date.getDay() !== 0 && view === 'day'
    });

    const card_descricao = $('div#card_descricao');
    card_descricao.toggle();

    $scope.andar_atual = 1;
    $scope.sala_selecionada = {};
    $scope.salas = [...$('rect.sala[id][ng-click]')].map(e => e.id);
    $rootScope.mapa_salas = {
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
        'M1': new Reserva('07:30', '08:20'),
        'M2': new Reserva('08:20', '09:10'),
        'M3': new Reserva('09:10', '10:00'),
        'M4': new Reserva('10:20', '11:10'),
        'M5': new Reserva('11:10', '12:00'),
        'M6': new Reserva('12:00', '12:50'),
        'T1': new Reserva('13:00', '13:50'),
        'T2': new Reserva('13:50', '14:40'),
        'T3': new Reserva('14:40', '15:30'),
        'T4': new Reserva('15:50', '16:40'),
        'T5': new Reserva('16:40', '17:30'),
        'T6': new Reserva('17:30', '18:20'),
        'N1': new Reserva('18:40', '19:30'),
        'N2': new Reserva('19:30', '20:20'),
        'N3': new Reserva('20:20', '21:10'),
        'N4': new Reserva('21:20', '22:10'),
        'N5': new Reserva('22:10', '23:00')
    };

    $scope.reservarSala = (sala) => {
        var horaInicio = $('#horaInicioReserva').val();
        var horaFinal = $('#horaFinalReserva').val();
        var data = $('[data-toggle="datepicker"]').val();
        if (horaInicio != 'Horario Inicial' && horaFinal != 'Horario Final') {
            if (horaInicio < horaFinal) {
                if (horaInicio > moment().format('LT') || data != moment().format('DD/MM/YYYY')) {
                    let reserva = new Reserva(horaInicio, horaFinal);
                    reserva.data = data;
                    reserva.usuario = $rootScope.usuarios[$rootScope.usuario];

                    $.snackbar({ content: $scope.mapa_salas[sala].novaReserva(reserva) });

                    card_descricao.fadeToggle("slow", "linear");
                    $scope.mostrarDetalhes($scope.sala_selecionada.nome);
                    card_descricao.fadeToggle("slow", "linear");
                } else $.snackbar({ content: 'Horário inicial deve ser maior que o horário atual' });
            } else $.snackbar({ content: 'Horário inicial deve ser menor que o horário final' });
        } else $.snackbar({ content: 'Selecione um horário válido' });
    };

    $scope.mostrarDetalhes = (sala) => {
        setTimeout(() => {
            $scope.$apply(() => {
                for (let reserva of Object.keys($scope.horarios)) {
                    $scope.horarios[reserva].data = $('[data-toggle="datepicker"]').val();
                }
            });
        }, 500);

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

    $scope.mudarAndar = (andar) => $scope.andar_atual = andar;

    document.getElementById('dataReserva').addEventListener('focusout', () => {
        card_descricao.fadeToggle("slow", "linear");
        $scope.mostrarDetalhes($scope.sala_selecionada.nome);
        card_descricao.fadeToggle("slow", "linear");
    });
});