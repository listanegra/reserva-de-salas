class Sala {

    constructor(bloco, piso, descricao) {
        this.bloco = bloco;
        this.piso = piso;
        this.descricao = descricao;
        this.reservas = [];
    }

    addReserva(periodo) {
        this.reservas.push(periodo);
    }

}

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
    }).when('/salas', {
        templateUrl: './templates/mapa.html',
        controller: 'Mapa'
    }).otherwise('/');
});

app.controller('Main', function($scope, $rootScope, $location) {
    $rootScope.usuarios = {
        'admin': { permissions: 'root' }
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

});

app.controller('Mapa', function($scope, $rootScope, $location) {
    const card_descricao = $('div#card_descricao');
    card_descricao.toggle();

    $scope.sala_selecionada = {};
    $scope.salas = [...$('rect.sala[id][ng-click]')].map(e => e.id);
    $scope.mapa_salas = {
        'Mini Auditorio': new Sala('C', "térreo", 'Mini Auditório',),
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
        $scope.mapa_salas[sala].addReserva(Date.now());
    }

    $scope.mostrarDetalhes = (sala) => {
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

});