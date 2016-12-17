console.log('r2-web-components by Akamukali Nnamdi Alexander.');


var R2_comp  = {};


(function(r2,$){

  r2.register_component = function(name,prop){
    
    prop.init  = prop.init || function(){};
    prop.render  = prop.render || function(){return 'element';};
    prop.subscribe  = prop.subscribe || function(name,data){};

    r2.kernel.registerred_components[name] = prop;

  }
 
  r2.kernel = {};
  r2.kernel['registerred_components'] = {};
  r2.kernel['registerred_instances'] = {};
  r2.kernel['recycled_ids'] = {};
  r2.kernel['index_pointer'] = -1;


  r2.kernel['garbage_unused_components'] = function(){
    $.each(r2.kernel.registerred_instances,function(k,v){
    	if (v.garbaged){
            v.$el.remove();
            delete r2.kernel.registerred_instances[k];
    	}
    });
  };  

  r2.kernel['scan_for_jobs'] = function(){
    if (r2.kernel.jobs.length > 0){
      $.each(r2.kernel.jobs,function(k,v){
      	//console.log(v);
      	if (v){
	      	v.start();
	      	v.complete();
	      	r2.kernel.jobs.splice(k,1);
      	}
      });
    }
  };  

  r2.kernel['jobs'] = [];
  r2.kernel['bubbles'] = [];

  r2.kernel['scan_for_bubbles'] = function(){
    if (r2.kernel.bubbles.length > 0){
      $.each(r2.kernel.bubbles,function(k,v){
      	//console.log(v);
      	//v.start();
      	//v.complete();
      	$.each(r2.kernel.registerred_instances,function(ky,vl){
      		vl.subscribe(v.evt,v.data);
      	});
      	r2.kernel.bubbles.splice(k,1);
      });
    }
  };  


  r2.kernel['post'] = function(cb,cbc){
    r2.kernel.jobs.push({
    	start:cb,
    	complete:cbc
    });
  };

  r2.kernel['publish'] = function(evt,data){
    r2.kernel.bubbles.push({
    	evt:evt,
    	data:data
    });
  };



  r2.kernel['scan_for_new_components'] = function(){
    
    $('*').each(function(k,v){
        var $this = $(this);
        if (!$this.data('component_registerred')){
          
          $this.data('component_registerred',true);
          ++r2.kernel.index_pointer;

          $.each(r2.kernel.registerred_components,function(kk,vv){
          
             if ($this.is(kk)){
                
                var inst = {};

                inst.get_notification = function(ev_data){};
                $.each(vv,function(p,m){
                  inst[p] = m;
                });



                inst.el = $this;
                inst.dom = r2.kernel;
                inst.$el = $this;
                inst.process_id = r2.kernel.index_pointer;
                inst.instance_name = kk;
                inst.garbaged = false;
                inst.remove = function(){
                	this.garbaged = true;
                };
                inst.publish = r2.kernel.publish;
                inst.post = r2.kernel.post;

                inst.on = function(evt,cb){
                  var self = this;
                  self.el.on(evt,function(e){
                     cb.apply(self,[e]);
                  });  
                };

                inst.off = function(evt){
                   this.el.off(evt); 
                };


                
                $this.append(inst.render({
                	el:this,
                	dom:r2.kernel,
                	self:inst
                }));

                inst.init({
                	el:$this,
                	dom:r2.kernel,
                	self:inst
                });


                r2.kernel.registerred_instances[r2.kernel.index_pointer] = inst; //register new component here.

                $this.on('garbage',function(){
                	inst.remove();
                	return false;
                });

                $this.on('notify',function(e,dt_){
                  inst.get_notification(dt_);
                });

                //console.log(inst);

             }

          });

        }

    });    

  };
  


 
  r2.kernel['$thread'] = function(){
     
     //console.log('calling thread ...');
     r2.kernel.scan_for_new_components();
     r2.kernel.scan_for_jobs();
     r2.kernel.scan_for_bubbles();
     r2.kernel.garbage_unused_components();

  };


   




    //Wait for the DOM to initialize/load
	$(function(){
	  setInterval(function(){
	     r2.kernel.$thread();
	  },100);
	});
  


})(R2_comp,jQuery);
