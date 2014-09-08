/**
 * Developed by samber, 08 September 2014
 * Used for Vizir Project (vizir.co)
 *
 * Usage:
 *      $httpSaasApi.get("/path/42", { firstname: "John", lastname: "Doe" }, function (data) {
 *          console.log("sent");
 *      });
 *
 *      <http-saas-api-success success="api.success" />
 *      <http-saas-api-is-loading loading="api.loading" />
 *      <http-saas-api-errors errors="api.errors" />
 */



var httpSaasApi = angular.module('httpSaasApi', ['ng']);


httpSaasApi.service('$httpSaasApi', ['$http', '$rootScope', "$timeout", function ($http, $rootScope, $timeout) {

    // temps après laquelle une erreur ou une réussite d'appel disparait
    var TIMEOUT_CALLBACK_MESSAGE = 5000;

    // nombre de requêtes en cours
    // permet d'afficher un sablier
    // incremental (pas boolean) -> permet de cumuler plusieurs requeêtes en même temps
    this.loading = 0;

    // nombre de requetes réussies pendant les TIMEOUT_CALLBACK_MESSAGE dernieres millisecondes
    this.success = 0;

    // queue qui contient les dernieres erreurs http
    // une erreur disparait apres "TIMEOUT_CALLBACK_MESSAGE" ms
    this.errors = new Array();

    var self = this;



    /***************************************************
     *            GESTION DES APPELS HTTP
     **************************************************/


    /**
     * Implement each http method (REST)
     */
    this.get = function (url, params, success, error) {
        return httpCall($http.get, url, { params: params }, success, error);
    };
    this.post = function (url, params, success, error) {
        return httpCall($http.post, url, params, success, error);
    };
    this.put = function (url, params, success, error) {
        return httpCall($http.put, url, params, success, error);
    };
    this.delete = function (url, params, success, error) {
        return httpCall($http.delete, url, params, success, error);
    };

    /**
     * Used by all http methods
     * @param call
     * @param url
     * @param params
     * @param success
     * @param error
     * @returns {*}
     */
    var httpCall = function (call, url, params, success, error) {
        self.loading++;

        return call(url, params).success(function(body, status, headers, config) {
            return catchSuccess(success, body, status, headers, config)
        }).error(function(body, status, headers, config) {
            return catchError(error, body, status, headers, config)
        });
    };


    /**
     * Catch les events de retours de $http.[METHOD]
     * @param callback
     * @param body
     * @param status
     * @param headers
     * @param config
     * @returns {*}
     */
    var catchSuccess = function (callback, body, status, headers, config) {
        self.loading--;
        self.success++;

        $timeout(function () {
            self.success--;     // on fait disparaitre le message de confirmation que la requete a fonctionnée
        }, TIMEOUT_CALLBACK_MESSAGE);

        if (callback != undefined)
            return callback(body, status, headers, config);
    };
    var catchError = function (callback, body, status, headers, config) {
        self.loading--;

        addError(body, status);

        if (callback != undefined)
            return callback(body, status, headers, config);
    };





    /***************************************************
     *              GESTION DES ERREURS
     **************************************************/


    /**
     * On rajoute une erreur dans la queue
     */
    var addError = function (body, status) {
        self.errors.push({
            body: body,
            status: status,
            timestamp: new Date().getTime()
        });

        $timeout(checkExpiredErrors, TIMEOUT_CALLBACK_MESSAGE * 1.1);
    };

    /**
     * L'erreur étant expirée, on la supprime de la queue et elle n'apparaitra plus à l'écran
     */
    var checkExpiredErrors = function () {
        var date = new Date().getTime() - TIMEOUT_CALLBACK_MESSAGE;

        for (var i = 0; i < self.errors.length; ++i) {
            if (self.errors[i].timestamp < date) {
                self.errors.splice(i, 1);
                --i;
            }
        }
    };



}]);




/*************************************************
 **********  affichage des trois valeurs *********
 ************************************************/

httpSaasApi.directive('httpSaasApiIsLoading', ["$httpSaasApi", function($httpSaasApi) {

    return ({
        restrict: 'EA',
        scope: {
            loading: "=?"
        },
        template: "<span>{{loading > 0 ? 'Working' : ''}}</span>",
        link: function (scope, element, attrs) {
            // bullshit pour appliquer un $watch sur une variable du service
            scope.service = $httpSaasApi;
//            scope.$watch('service.loading', function (loading) {
            scope.$watch(function () { return $httpSaasApi.loading; }, function (loading) {
                scope.loading = loading;
            });
        }
    });
}]);

httpSaasApi.directive('httpSaasApiSuccess', ["$httpSaasApi", function($httpSaasApi) {

    return ({
        restrict: 'EA',
        scope: {
            success: "=?"
        },
        template: "<span>{{success > 0 ? 'Saved' : ''}}</span>",
        link: function (scope, element, attrs) {
            // bullshit pour appliquer un $watch sur une variable du service
            scope.service = $httpSaasApi;
            scope.$watch('service.success', function (success) {
                scope.success = success;
            });
        }
    });
}]);

httpSaasApi.directive('httpSaasApiErrors', ["$httpSaasApi", function($httpSaasApi) {

    return ({
        restrict: 'EA',
        scope: {
            errors: "=?"
        },
        template: "<span ng-if='errors.length > 0'>{{errors[0].status + ' ' + errors[0].message}}</span>",
        link: function (scope, element, attrs) {
            // bullshit pour appliquer un $watch sur une variable du service
            scope.service = $httpSaasApi;
            scope.$watch('service.errors', function (errors) {
                scope.errors = errors;
            });
        }
    });
}]);

