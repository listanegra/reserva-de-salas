var drawer = $('div.bmd-layout-container.bmd-drawer-f-l');
window.updateDrawer = () => window.innerWidth < 720 ? drawer.addClass('bmd-drawer-overlay') : drawer.removeClass('bmd-drawer-overlay');
$(window).on('resize', window.updateDrawer);

var app = angular.module("app", ["ngRoute"]).config(($routeProvider) => {
    $routeProvider.when('/', {
        templateUrl: './templates/login.html',
    }).when('/home', {
        templateUrl: './templates/home.html',
        controller: 'Home'
    }).when('/cadastro', {
        templateUrl: './templates/cadastro.html',
        controller: 'Cadastro'
    }).otherwise('/');
});

app.controller('Main', function ($scope, $rootScope, $location) {
    $rootScope.usuarios = {
        'admin': { permissions: 'root' }
    };

    $scope.$on('$viewContentLoaded', () => {
        $('body').bootstrapMaterialDesign();
        window.updateDrawer();
    });

    $scope.isLoginScreen = () => {
        return $location.path() == '/';
    }

    $scope.checkUsuario = (usuario) => {
        console.log(usuario);
        return $rootScope.usuarios[usuario] && $rootScope.usuarios[usuario].permissions == 'root';
    }
});

app.controller('Home', function ($scope, $rootScope, $location) {

});

app.controller('Cadastro', function ($scope, $rootScope, $location) {

});