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
        'Mini Auditorio': {
            bloco: 'C',
            piso: "térreo",
            descricao: 'Mini Auditório'
        },
        'Auditorio': {
            bloco: 'C',
            piso: "térreo",
            descricao: 'Auditório'
        },
        'C102': {
            bloco: 'C',
            piso: "térreo",
            descricao: 'Laboratório de Informática'
        },
        'C103': {
            bloco: 'C',
            piso: "térreo",
            descricao: 'Laboratório de Informática'
        },
        'C104': {
            bloco: 'C',
            piso: "térreo",
            descricao: 'Laboratório de Informática'
        },
        'C105': {
            bloco: 'C',
            piso: "térreo",
            descricao: 'Sala de Xadrez'
        },
        'C106': {
            bloco: 'C',
            piso: "térreo",
            descricao: 'Laboratório Interdisciplinar'
        },
        'C107': {
            bloco: 'C',
            piso: "térreo",
            descricao: 'Laboratório de Computação Aplicada'
        },
        'C108': {
            bloco: 'C',
            piso: "térreo",
            descricao: 'Sala de Aula Teórica'
        },
        'C110': {
            bloco: 'C',
            piso: "térreo",
            descricao: 'Laboratório Eletrônica'
        },
        'C113': {
            bloco: 'C',
            piso: "térreo",
            descricao: 'Laboratório Química B'
        },
        'C114': {
            bloco: 'C',
            piso: "térreo",
            descricao: 'Laboratório Química A'
        },
        'C201': {
            bloco: 'C',
            piso: "superior",
            descricao: 'Laboratório de Informática I'
        },
        'C202': {
            bloco: 'C',
            piso: "superior",
            descricao: 'Laboratório de Informática III'
        },
        'C203': {
            bloco: 'C',
            piso: "superior",
            descricao: 'Laboratório de Informática V'
        },
        'C207': {
            bloco: 'C',
            piso: "superior",
            descricao: 'Laboratório de Manutenção'
        },
        'C208': {
            bloco: 'C',
            piso: "superior",
            descricao: 'Laboratório de Informática IV'
        },
        'C209': {
            bloco: 'C',
            piso: "superior",
            descricao: 'Calem Línguas I'
        },
        'C210': {
            bloco: 'C',
            piso: "superior",
            descricao: 'Calem Línguas II'
        },
        'C212': {
            bloco: 'C',
            piso: "superior",
            descricao: 'Calem Línguas III'
        }
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