(function ($) {
  $('.spinner .btn:first-of-type').on('click', function() {
    $('.spinner input').val( parseInt($('.spinner input').val(), 10) + 1);
  });
  $('.spinner .btn:last-of-type').on('click', function() {
    $('.spinner input').val( parseInt($('.spinner input').val(), 10) - 1);
  });
})(jQuery);
  $( function() {
$("#form_main2").hide();
	  var global_val=1;
	  var e_global_val=1;
  $('#eligibiltyform').click(function(){
  if($(this).prop("checked")==true){
 $("#form_main2").slideDown();
  }
  else
  {
	  $("#form_main2").slideUp();
	  $("#form_main2")[0].reset();
  }
});
$("body").on("change",".qtype",function(){
var cat=$(this).find(':selected').attr('data-cat');
if(cat=="choice"){ $(this).parent("div").next("div").removeClass("hide"); }else{
	$(this).parent("div").next("div").children(".no_of_options").prop('selectedIndex',0);
	$(this).parent("div").next("div").addClass("hide");
	$(this).parent("div").next("div").siblings(".answers").addClass("hide");
	$(this).parent("div").next("div").siblings(".answers").children(".answers_content").html("");
	}
});
$("body").on("change",".no_of_options",function(){
var no_of_ans=$(this).find(':selected').val();
if(no_of_ans!="0"){
	 $(this).parent("div").next(".answers").removeClass("hide");
	  $(this).parent("div").next(".answers").children(".answers_content").html("");
	 for(i=1;i<=no_of_ans;i++){
	 $(this).parent("div").next(".answers").children(".answers_content").append('<div class="col-sm-6"><input class="form-control" name="ques'+global_val+'_ans[]" placeholder="Answer '+i+' Text" required=""/></div><div class="col-sm-6"><input class="form-control" name="ques'+global_val+'_scores[]" placeholder="Answer '+i+' Scores" required="" /></div><br/>');}}else{	 $(this).parent("div").next(".answers").addClass("hide");}
});
$("#add-more").click(function(e){
e.preventDefault();
global_val++;
$("#questionlist").append('<div class="dynamic"><hr/><div class="form-group"><label for="qtitle'+global_val+'">'+global_val+'. Question Title</label><input type="text" class="form-control" name="qtitle'+global_val+'" placeholder="Enter Title" required></div><div class="form-group"><label for="q'+global_val+'_type">Question Type</label><select  class="form-control qtype" name="q'+global_val+'_type"><option data-cat="">Select Answer Type</option><option data-cat="choice">Checkbox</option><option data-cat="choice">Radio</option><option data-cat="">Text</option><option data-cat="">Scale</option></select></div><div class="form-group hide questions_answers"><label for="no_of_options">No Of Answers</label><select  class="form-control no_of_options" name="q'+global_val+'_no_of_options" ><option value="0">Select no of Answers</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></div><div class="form-group hide answers"><label for="no_of_options">Answers</label><div class="col-lg-12 answers_content"></div></div></div>');

});
	$("#btn-remove").click(function(event){
										event.preventDefault();
										
										if(global_val>1){
											$(".dynamic").last().remove();
											global_val--;
										}
										});
										
										$(".tags").chosen();
										
//eligibilty form
$("body").on("change",".e-qtype",function(){
var cat=$(this).find(':selected').attr('data-cat');
if(cat=="choice"){ $(this).parent("div").next("div").removeClass("hide"); }else{
	$(this).parent("div").next("div").children(".e-no_of_options").prop('selectedIndex',0);
	$(this).parent("div").next("div").addClass("hide");
	$(this).parent("div").next("div").siblings(".e-answers").addClass("hide");
	$(this).parent("div").next("div").siblings(".e-answers").children(".e-answers_content").html("");
	}
});
$("body").on("change",".e-no_of_options",function(){
var no_of_ans=$(this).find(':selected').val();
if(no_of_ans!="0"){
	 $(this).parent("div").next(".e-answers").removeClass("hide");
	  $(this).parent("div").next(".e-answers").children(".e-answers_content").html("");
	 for(i=1;i<=no_of_ans;i++){
	 $(this).parent("div").next(".e-answers").children(".e-answers_content").append('<div class="col-sm-6"><input class="form-control" name="e-ques'+global_val+'_ans[]" placeholder="Answer '+i+' Text" required=""/></div><div class="col-sm-6"><input class="form-control" name="e-ques'+global_val+'_scores[]" placeholder="Answer '+i+' Scores" required="" /></div><br/>');}}else{	 $(this).parent("div").next(".e-answers").addClass("hide");}
});
$("#e-add-more").click(function(ev){
ev.preventDefault();
e_global_val++;
$("#e-questionlist").append('<div class="e-dynamic"><hr/><div class="form-group"><label for="e-qtitle'+e_global_val+'">'+e_global_val+'. eligibilty Question </label><input type="text" class="form-control" name="e-qtitle'+e_global_val+'" placeholder="Enter Title" required></div><div class="form-group"><label for="e-q'+e_global_val+'_type">Question Type</label><select  class="form-control e-qtype" name="e-q'+e_global_val+'_type"><option data-cat="">Select Answer Type</option><option data-cat="choice">Checkbox</option><option data-cat="choice">Radio</option><option data-cat="">Text</option><option data-cat="">Scale</option></select></div><div class="form-group hide e-questions_answers"><label for="e-no_of_options">No Of Answers</label><select  class="form-control e-no_of_options" name="e-q'+e_global_val+'_no_of_options" ><option value="0">Select no of Answers</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></div><div class="form-group hide e-answers"><label for="e-no_of_options">Answers</label><div class="col-lg-12 e-answers_content"></div></div></div>');

});
	$("#e-btn-remove").click(function(event){
										event.preventDefault();
										
										if(e_global_val>1){
											$(".e-dynamic").last().remove();
											e_global_val--;
										}
										});








});