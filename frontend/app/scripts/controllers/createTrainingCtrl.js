'use strict';

angular.module('frontendApp')
  .controller('CreateTrainingCtrl', ['$scope', '$rootScope', '$localStorage', '$compile', '$location', '$templateRequest',
    '$sce', 'FileUploader' ,'createTraining', 'userlist', 'postAttachLinks',
    function($scope, $rootScope, $localStorage, $compile, $location, $templateRequest,
             $sce, FileUploader, createTraining, userlist, postAttachLinks) {


    $scope.data = {};
    $scope.data.entries = [];

    $scope.data.trainerId = $localStorage.userData.id;

    $scope.entryNum = 1;

    $scope.me = $localStorage.userData.name;

    $scope.data.repeated = false;

    $scope.newTraining = true;

    $scope.attachments = [];
    $scope.attachment = {};

      $scope.removeEntry = function($event) {
      var index = angular.element($event.currentTarget).parents('.entry').children('[index]').attr('index');
      angular.element($event.currentTarget).parents('.entry').remove();
      if(index == $scope.entryNum - 1) {
        $scope.entryNum--;
      } else {
        $scope.data.entries[index] = null;
      }
    };

    $scope.$watch('data.repeated', function(newVal, oldVal) {
      if(oldVal !== newVal) {
        $scope.data.begin = null;
        $scope.data.end = null;
        angular.element('.entry').remove();
        $scope.entryNum = 1;

      }
    });

    $scope.addEntry = function() {
      var templateUrl = $sce.getTrustedResourceUrl('views/templates/newEntry.html');
      $templateRequest(templateUrl).then(function(template) {
        angular.element('#trainingEntries').append($compile(template)($scope));
        $scope.entryNum++;
      });
    };



    $scope.save = function() {
      $scope.data.status = ($rootScope.isAdmin()) ? "APPROVED" : "DRAFTED";
      var create = new createTraining();
      create.data = angular.copy($scope.data);
      console.log(create.data);
      for(var i = 0; i < create.data.entries.length; i++) {
        create.data.entries[i].beginTime = create.data.entries[i].beginTime.valueOf();
        create.data.entries[i].endTime = create.data.entries[i].endTime.valueOf();
      }
      if($scope.data.repeated) {
        create.data.begin = create.data.begin.valueOf();
        create.data.end = create.data.end.valueOf();
      }
      createTraining.save({},$scope.data).$promise.then(function(resp){
        $scope.uploadUrl = 'http://localhost:8080/files/upload?trainingId=' + resp.id;
        $scope.trainingId = resp.id;
        for(var i = 0; i < $scope.attachments.length; i++) {
          _.extend($scope.attachments[i], {trainingId : $scope.trainingId});
        }
        postAttachLinks.save($scope.attachments).$promise.then(function(resp) {
          uploader.uploadAll();
          if(_.isEmpty(uploader.queue)) {
            $location.path('/training/' + $scope.trainingId);
          }
        });
      });
    };

      $scope.addLink = function() {
        $scope.attachments.push(angular.copy($scope.attachment));
        angular.element('.links').append($compile('<li><a href="'+$scope.attachment.link+'">'+$scope.attachment.name+' </a>&nbsp;<i class="fa fa-close" ng-click="removeLink($event)"></i></li>')($scope));
        $scope.attachment = {};

      };

      $scope.removeLink = function($event) {
        var name = angular.element($event.currentTarget).parents('li').children('a').html().split(' ')[0];
        var link = angular.element($event.currentTarget).parents('li').children('a').attr('href');
        var index = _.findLastIndex($scope.attachments, {name: name, link: link});
        delete $scope.attachments[index];
        angular.element($event.currentTarget).parents('li').remove();
      };

      var uploader = $scope.uploader = new FileUploader();
      uploader.withCredentials = true;



      //CALLBACKS
      uploader.onBeforeUploadItem = function(item) {
        item.url = $scope.uploadUrl;
      };
      uploader.onCompleteAll = function() {
        $location.path('/training/' + $scope.trainingId);
      };
      //END_CALLBACKS

      $scope.users = [];
      if($rootScope.isAdmin() && _.isEmpty($scope.users)) {
        userlist.getUserList(function(resp) {
          $scope.users = angular.copy(resp);
        })
      } else {
        $scope.users = $localStorage.userData;
      }

    }]);
