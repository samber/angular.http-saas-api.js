angular.http-saas-api.js
========================

AngularJs module for SaaS API ("Working"/"Saved"/"Error").

Example on <code><a href="http://vizir.co">Vizir.co</a></code>

### USAGE
#### Javascript

    $httpSaasApi.get("/path/42", { firstname: "John", lastname: "Doe" },function (data) {
      
      // success
      console.log("sent");
      
    }, function (data, status) {
      
      // error
      // you can read this error in $httpSaasApi.errors
      console.log("error");
    
    }); 
#### HTML:

    <http-saas-api-success success="api.success" />
    <http-saas-api-is-loading loading="api.loading" />
    <http-saas-api-errors errors="api.errors" />

