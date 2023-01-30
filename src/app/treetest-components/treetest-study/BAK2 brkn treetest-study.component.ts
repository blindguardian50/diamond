import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

import { UserService } from '../../user.service';

declare var $: any;

@Component({
  selector: 'app-test',
  templateUrl: './treetest-study.component.html',
  styleUrls: ['./treetest-study.component.css', '../../app.component.css']
})
export class TreetestStudyComponent implements OnDestroy, OnInit {

  
  taskIndex = 0;
  tests = [];
  test = {
    clicks: [],
    answer: {},
    time: null
  };
  startTime;
  endTime;
  doingTask = false;
  enterPassword = '';
  studyPassword = '';
  study;
  password = false;
  finished = false;
  selectedAnswer = false;
  // tslint:disable-next-line:no-string-literal
  id = this.route.snapshot.params['id'];
  intro = true;
  showTree = false;
  userName = "";
  feedback = "";
  feedbackDone = false;

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router, private userService: UserService) { 
    var date = (new Date()).toISOString().slice(0, 19).replace(/-/g, "-").replace("T", " ");
  }

  getTestData() {
    /*const header = new Headers({ Authorization: 'Bearer ' + (JSON.parse(localStorage.getItem('currentUser'))).token});*/
    const httpOptions = {
        headers: new HttpHeaders({
        'Content-Type':  'application/json',
          Authorization: 'Bearer ' + (JSON.parse(localStorage.getItem('currentUser'))).token
      })
  };
    return this.http.post(this.userService.serverUrl +  '/users/tree-tests/' + this.id, "", httpOptions);
  }

  ngOnDestroy() {
    if (!this.finished) {
      //add results in database
      const test = {
        id: this.id,
        tests: this.tests,
        finished: false,
        username: this.userName,
        timestamp: (new Date()).toISOString().slice(0, 19).replace(/-/g, "-").replace("T", " "),
        feedback: ""
      };

      this.postTestData(test)
      .subscribe(
        res => {
          console.log(res);
        },
        err => {
          console.log(err);
        }
      );
    }
  }

  ngOnInit() {
    $('[data-toggle="tooltip"]').tooltip();
    this.getTestData()
    .subscribe(
      res => {
        console.log(res);
      },
      err => {
        console.log(err);
      }
    );

    if (localStorage.getItem('jstree')) {
      localStorage.removeItem('jstree');
    }
    const body = {
      id: this.id
    };
    this.passwordRequired(body)
      .subscribe(
        res => {
          console.log(res);

          if (res === 'redirect') {
            console.log('redirect');
            this.router.navigate(['study-closed']);
          } else {
            console.log('NO REDIRECT');
          }
          if (res) {
            this.password = true;
          } else {
            this.password = false;
            this.preparePassword();
          }
        },
        err => {
          console.log(err);
          this.password = false;
        }
      );
  }

  sendFeedback() {
    const test = {
      username: this.userName,
      feedback: this.feedback
    };

    this.postFeedback(test)
    .subscribe(
      res => {
        console.log(res);
        this.feedbackDone = true;
      },
      err => {
        this.feedbackDone = true;
        console.log(err);
      }
    );
  }

  submitFinalAnswer(index, skipped) {
    const instance = $('#study-tree').jstree(true);
    if (skipped) {
      this.test['answer'] = null;
    } else {
    // tslint:disable-next-line:no-string-literal
      this.test['answer'] = (instance.get_selected())[0];
    }
    this.endTime = new Date();
    const timeDiff = (this.endTime - this.startTime) / 1000; // in seconds
    // tslint:disable-next-line:no-string-literal
    this.test['time'] = timeDiff;
    this.startTime = undefined;
    this.endTime = undefined;
    this.tests.push(this.test);
    this.test =  {
      clicks: [],
      answer: {},
      time: null
    };
    $(".jstree").jstree('close_all');
    $('.jstree').jstree('open_node', '#root');
    //$("#study-tree").jstree("close_all", -1);
    this.taskIndex++;
    if (localStorage.getItem('jstree')) {
      localStorage.removeItem('jstree');
    }
    if (this.taskIndex >= this.study.tasks.length) {
      this.finished = true;
      //add results in database
      const test = {
        id: this.id,
        tests: this.tests,
        finished: true,
        username: this.userName,
        timestamp: (new Date()).toISOString().slice(0, 19).replace(/-/g, "-").replace("T", " "),
        feedback: ""
      };

      this.postTestData(test)
      .subscribe(
        res => {
          console.log(res);
        },
        err => {
          console.log(err);
        }
      );
    }
    this.doingTask = false;
    this.selectedAnswer = false;

  }

  startTask(index) {
    this.showTree = false;
    this.doingTask = false;
    this.startTime = new Date();
    this.createTree('study-tree', (this.study).tree);
    setTimeout(() => {


  // DBF 2352352 START

  var Visi_nodes = [];

  // Push every chilren of that node into the Visi_nodes list.
  function getChildrenOfNode(node, tree) {
  
    if (node.children) {
      for (var i = 0; i < node.children.length; i++) {
        var childNode = tree.get_node(node.children[i]);
        //console.log("pushing this child node: ", childNode.id);
          
        Visi_nodes.push(childNode.id);
        tree.show_node(childNode);

        getChildrenOfNode(childNode, tree);
      }
    }
  }

  // Push key nodes, from this node to the absolute root node, into Visi_nodes list.
  function getPathToRoot(node,tree){

    //console.log("Node: ",node, ", has parent: ", node.parent);

    const parent_node = tree.get_node(node.parent);

    if(node.parent){
      Visi_nodes.push(node.parent);
      getPathToRoot(parent_node,tree);
    }
  }

  // THIS METHOD IS OBSOLETE, IT REMAINS FOR POTENTIAL LATER USE.
  // Make all parent nodes visible.
  function showAllParentNodes(node,tree){

    const parent_node = tree.get_node(node.parent);

    // console.log("parent node: ", parent_node);

    if (parent_node.children) {
      for (var i = 0; i < parent_node.children.length; i++) {
        var childNode = tree.get_node(parent_node.children[i]);
        // console.log("showing child: ", childNode.id);
        tree.show_node(childNode);
      }
    }    
  }

  // THIS METHOD IS OBSOLETE, IT REMAINS FOR POTENTIAL LATER USE.
  // Close all child nodes, in case the user skipped levels when closing.
  function closeAllChildren(node,tree){

    if (node.children) {
      for (var i = 0; i < node.children.length; i++) {
        var childNode = tree.get_node(node.children[i]);
          
        tree.close_node(childNode,false);
        closeAllChildren(childNode, tree);
      }
    }
  }

  // DBF 2352352 END

      if (!this.taskIndex) {
        // tslint:disable-next-line:only-arrow-functions
        $('#study-tree').on('select_node.jstree', (e, data) => {
          if (!data.node.children.length) {
            this.selectedAnswer = true;
            //console.log("!data.node.children.length");
          } else {
            if (!this.study.leafNodes) {
              this.selectedAnswer = true;
              //console.log("!this.study.leafNodes");
            } else {
              this.selectedAnswer = false;
              //console.log("else to !this.study.leafNodes");                          
            }
            $("#study-tree").jstree("open_node", $("#" + data.node.id));
            var obj =  data.instance.get_node(data.node, true);
            if(obj) {
              obj.siblings('.jstree-open').each(function () { data.instance.close_node($('#study-tree'), 0); });
              //console.log("else to !data.node.children, outer");
               
            }
          }
        });
        $("#study-tree").bind("open_node.jstree", (event, data) => { 
          if (data.node.id !== 'root') {
            this.test['clicks'].push(data.node);
            //console.log(".bind open_node.jstree");
            
          }
          var obj =  data.instance.get_node(data.node, true);
          
          if (obj) {
            obj.siblings('.jstree-open').each(function () {       data.instance.close_node(this, 0); 
            data.instance.close_all(this, 0); 
            //console.log("obj.siblings close nodes");
            
            }); 
          }
        });


        // DBF 938563 START

        // When any node is opened.
        $("#study-tree").on("open_node.jstree", function(e, data){
  
          var tree = $('#study-tree').jstree(true);
          
          // Get all children and save in Visi_nodes[].
          getChildrenOfNode(data.node, tree);
          //console.log("Visi_nodes: ", Visi_nodes); 
          
          var expanded_node = data.node.id;
        
          // Get path to root and save in Visi_nodes[].
          getPathToRoot(data.node, tree);
          //console.log("Visi_nodes with root path: ", Visi_nodes); 
        
        
          // Hide all other nodes but the one expanded.
          const len_tree = Object.keys(data.instance._model.data).length;
          for(let i = 0; i < len_tree; i++) {
          //console.log("hide check: ", Object.keys(data.instance._model.data)[i]);
            const val = Object.keys(data.instance._model.data)[i];
            if(!Visi_nodes.includes(val) && val != expanded_node){
              //console.log("val: ", val ," not in in VisiNodes.");
              data.instance.hide_node(val);
            }              
          }
          Visi_nodes.length = 0;
        });
        
        // On any closed node.
        $("#study-tree").on("close_node.jstree", function(e, data){

          var tree = $('#study-tree').jstree(true);

          // This is required in order for the expand arrows to not mess up.
          if(data.node.parent === "#"){
            $('#study-tree').jstree(true).show_all();      
          }
          else{
            // This is required in order for the expand arrows to not mess up.
                        
            $('#study-tree').off("close_node.jstree");
            closeAllChildren(data.node,tree);
            $('#study-tree').on("close_node.jstree");

            $('#study-tree').off("open_node.jstree");
            showAllParentNodes(data.node,tree);
            //tree.open_node(data.node.parent);
            $('#study-tree').on("open_node.jstree");

            tree.close_node(data.node.parent);
            tree.open_node(data.node.parent);            
          }
        });
                
        // DBF 938563 END


      }
    }, 500);
  }

  createTree(id, content) {
    $('#' + id).jstree({
      core : {
        expand_selected_onload : false,
        animation : 0,
        check_callback : function test(op, node, par, pos, more) {
          console.log('here!!!');
        },
        themes : { icons: false  },
        data : content
      },
      types : {
        root : {
          icon : '/static/3.3.7/assets/images/tree_icon.png',
          valid_children : ['default']
        },
        default : {
          valid_children : ['default', 'file']
        },
        file : {
          icon : 'glyphicon glyphicon-file',
          valid_children : []
        }
      },
      plugins : [
        'contextmenu', 'dnd', 'search',
        'state', 'types', 'wholerow'
      ]
    });
    setTimeout(() => {
      $('#' + id).jstree("close_all");
      $('#' + id).jstree('open_node', '#root');
      this.doingTask = true;
    }, 500);
  }

  passwordRequired(id) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
        Authorization: 'Bearer ' + (JSON.parse(localStorage.getItem('currentUser'))).token
      })
  };
    return this.http.post(this.userService.serverUrl + '/users/tree-study/passwordrequired', id, httpOptions);
  }

  testInformation(id) {
    const header = new Headers({ Authorization: 'Bearer ' + (JSON.parse(localStorage.getItem('currentUser'))).token});
    const httpOptions = {
        headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
        Authorization: 'Bearer ' + (JSON.parse(localStorage.getItem('currentUser'))).token
      })
  };
    return this.http.post(this.userService.serverUrl + '/users/tree-study/get', id, httpOptions);
  }

  preparePassword() {
    const body = {
      id: this.id,
      password: this.enterPassword
    };
    this.sendPassword(body)
      .subscribe(
        res => {
          console.log(res);
          //console.log(JSON.stringify(res, null, 4));
          if (!res) {
            alert('Wrong password!');
          } else {
            this.study = res;
          }
        },
        err => {
          console.log('ERR');
          console.log(err);
          alert('Wrong password!');
        }
      );
  }

  sendPassword(body) {
    const httpOptions = {
        headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
          Authorization: 'Bearer ' + (JSON.parse(localStorage.getItem('currentUser'))).token
      })
  };
    return this.http.post(this.userService.serverUrl + '/users/tree-study/password', body, httpOptions);
  }

  postTestData(object) {
    const httpOptions = {
        headers: new HttpHeaders({
        'Content-Type':  'application/json',
          Authorization: 'Bearer ' + (JSON.parse(localStorage.getItem('currentUser'))).token
      })
    };
    return this.http.post(this.userService.serverUrl + '/users/tree-tests/add', object, httpOptions);
  }

  postFeedback(object) {
    const httpOptions = {
        headers: new HttpHeaders({
        'Content-Type':  'application/json',
          Authorization: 'Bearer ' + (JSON.parse(localStorage.getItem('currentUser'))).token
      })
    };
    return this.http.post(this.userService.serverUrl + '/users/tree-tests/feedback', object, httpOptions);
  }

}
