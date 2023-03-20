//**************** */
jQuery(document).ready(function () {
  jQuery("#srach-button").click(function () {
    // alert("hello");
    $(".search-form").toggle();
  });

  $(".dropdown").on("show.bs.dropdown", function () {
    $(this)
      .find(".dropdown-menu")
      .first()
      .stop(true, true)
      .slideDown();
  });
  // Add slideUp animation to Bootstrap dropdown when collapsing.
  $(".dropdown").on("hide.bs.dropdown", function () {
    $(this)
      .find(".dropdown-menu")
      .first()
      .stop(true, true)
      .slideUp();
  });

  // var box = $(".box");
  // var mainCanvas = $(".main-canvas");

  // box.draggable({
  //   containment: mainCanvas,
  //   helper: "clone",

  //   start: function () {
  //     $(this).css({
  //       opacity: 0
  //     });

  //     $(".box").css("z-index", "9");
  //   },

  //   stop: function () {
  //     $(this).css({
  //       opacity: 1
  //     });
  //   }
  // });

  // box.droppable({
  //   accept: box,

  //   drop: function (event, ui) {
  //     var draggable = ui.draggable;
  //     var droppable = $(this);
  //     var dragPos = draggable.position();
  //     var dropPos = droppable.position();

  //     draggable.css({
  //       left: dropPos.left + "px",
  //       top: dropPos.top + "px",
  //       "z-index": 20
  //     });

  //     droppable.css("z-index", 10).animate({
  //       left: dragPos.left,
  //       top: dragPos.top
  //     });
  //   }
  // });

  // // color box draggable (Blue BOX)

  // var box = $(".blue-box");
  // var mainCanvas = $(".main-canvas");

  // box.draggable({
  //   containment: mainCanvas,
  //   helper: "clone",

  //   start: function () {
  //     $(this).css({
  //       opacity: 0
  //     });

  //     $(".blue-box").css("z-index", "9");
  //   },

  //   stop: function () {
  //     $(this).css({
  //       opacity: 1
  //     });
  //   }
  // });

  // box.droppable({
  //   accept: box,

  //   drop: function (event, ui) {
  //     var draggable = ui.draggable;
  //     var droppable = $(this);
  //     var dragPos = draggable.position();
  //     var dropPos = droppable.position();

  //     draggable.css({
  //       left: dropPos.left + "px",
  //       top: dropPos.top + "px",
  //       "z-index": 20
  //     });

  //     droppable.css("z-index", 10).animate({
  //       left: dragPos.left,
  //       top: dragPos.top
  //     });
  //   }
  // });
});

// color box draggable (Yellow BOX)
// $(document).ready(function () {
//   var box = $(".yellow-box");
//   var mainCanvas = $(".main-canvas");

//   box.draggable({
//     containment: mainCanvas,
//     helper: "clone",

//     start: function () {
//       $(this).css({
//         opacity: 0
//       });

//       $(".yellow-box").css("z-index", "9");
//     },

//     stop: function () {
//       $(this).css({
//         opacity: 1
//       });
//     }
//   });

//   box.droppable({
//     accept: box,

//     drop: function (event, ui) {
//       var draggable = ui.draggable;
//       var droppable = $(this);
//       var dragPos = draggable.position();
//       var dropPos = droppable.position();

//       draggable.css({
//         left: dropPos.left + "px",
//         top: dropPos.top + "px",
//         "z-index": 20
//       });

//       droppable.css("z-index", 10).animate({
//         left: dragPos.left,
//         top: dragPos.top
//       });
//     }
//   });

//   // color box draggable (Red BOX)

//   var box = $(".red-box");
//   var mainCanvas = $(".main-canvas");

//   box.draggable({
//     containment: mainCanvas,
//     helper: "clone",

//     start: function () {
//       $(this).css({
//         opacity: 0
//       });

//       $(".red-box").css("z-index", "9");
//     },

//     stop: function () {
//       $(this).css({
//         opacity: 1
//       });
//     }
//   });

//   box.droppable({
//     accept: box,

//     drop: function (event, ui) {
//       var draggable = ui.draggable;
//       var droppable = $(this);
//       var dragPos = draggable.position();
//       var dropPos = droppable.position();

//       draggable.css({
//         left: dropPos.left + "px",
//         top: dropPos.top + "px",
//         "z-index": 20
//       });

//       droppable.css("z-index", 10).animate({
//         left: dragPos.left,
//         top: dragPos.top
//       });
//     }
//   });

//   // color box draggable (Purple BOX)
//   var box = $(".purple-box");
//   var mainCanvas = $(".main-canvas");

//   box.draggable({
//     containment: mainCanvas,
//     helper: "clone",

//     start: function () {
//       $(this).css({
//         opacity: 0
//       });

//       $(".purple-box").css("z-index", "9");
//     },

//     stop: function () {
//       $(this).css({
//         opacity: 1
//       });
//     }
//   });

//   box.droppable({
//     accept: box,

//     drop: function (event, ui) {
//       var draggable = ui.draggable;
//       var droppable = $(this);
//       var dragPos = draggable.position();
//       var dropPos = droppable.position();

//       draggable.css({
//         left: dropPos.left + "px",
//         top: dropPos.top + "px",
//         "z-index": 20
//       });

//       droppable.css("z-index", 10).animate({
//         left: dragPos.left,
//         top: dragPos.top
//       });
//     }
//   });

//   // color box draggable (Skyblue BOX)
//   var box = $(".skyblue-box");
//   var mainCanvas = $(".main-canvas");

//   box.draggable({
//     containment: mainCanvas,
//     helper: "clone",

//     start: function () {
//       $(this).css({
//         opacity: 0
//       });

//       $(".skyblue-box").css("z-index", "9");
//     },

//     stop: function () {
//       $(this).css({
//         opacity: 1
//       });
//     }
//   });

//   box.droppable({
//     accept: box,

//     drop: function (event, ui) {
//       var draggable = ui.draggable;
//       var droppable = $(this);
//       var dragPos = draggable.position();
//       var dropPos = droppable.position();

//       draggable.css({
//         left: dropPos.left + "px",
//         top: dropPos.top + "px",
//         "z-index": 20
//       });

//       droppable.css("z-index", 10).animate({
//         left: dragPos.left,
//         top: dragPos.top
//       });
//     }
//   });

//   // color box draggable (Green BOX)

//   var box = $(".green-box");
//   var mainCanvas = $(".main-canvas");

//   box.draggable({
//     containment: mainCanvas,
//     helper: "clone",

//     start: function () {
//       $(this).css({
//         opacity: 0
//       });

//       $(".green-box").css("z-index", "9");
//     },

//     stop: function () {
//       $(this).css({
//         opacity: 1
//       });
//     }
//   });

//   box.droppable({
//     accept: box,

//     drop: function (event, ui) {
//       var draggable = ui.draggable;
//       var droppable = $(this);
//       var dragPos = draggable.position();
//       var dropPos = droppable.position();

//       draggable.css({
//         left: dropPos.left + "px",
//         top: dropPos.top + "px",
//         "z-index": 20
//       });

//       droppable.css("z-index", 10).animate({
//         left: dragPos.left,
//         top: dragPos.top
//       });
//     }
//   });

//   // color box draggable (Orange BOX)
//   var box = $(".orange-box");
//   var mainCanvas = $(".main-canvas");

//   box.draggable({
//     containment: mainCanvas,
//     helper: "clone",

//     start: function () {
//       $(this).css({
//         opacity: 0
//       });

//       $(".orange-box").css("z-index", "9");
//     },

//     stop: function () {
//       $(this).css({
//         opacity: 1
//       });
//     }
//   });

//   box.droppable({
//     accept: box,

//     drop: function (event, ui) {
//       var draggable = ui.draggable;
//       var droppable = $(this);
//       var dragPos = draggable.position();
//       var dropPos = droppable.position();

//       draggable.css({
//         left: dropPos.left + "px",
//         top: dropPos.top + "px",
//         "z-index": 20
//       });

//       droppable.css("z-index", 10).animate({
//         left: dragPos.left,
//         top: dragPos.top
//       });
//     }
//   });
// });
