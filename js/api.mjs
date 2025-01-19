/*  ******* Data types *******
    image objects must have at least the following attributes:
        - (String) imageId 
        - (String) title
        - (String) author
        - (String) url
        - (Date) date

    comment objects must have the following attributes
        - (String) commentId
        - (String) imageId
        - (String) author
        - (String) content
        - (Date) date

****************************** */

var imageDisplays = {}; // contains imageid-innerhtml key-pairs image displays {1: innerhtml, 2:innerhtml, ...}
var messagesSections = {}; // contains comment section for each image display {1: messages.innerhtml, 2: messages.innerhtml, ...}
var curImageID = 0; // id of current image displayed
var lastImageID = 0; // the id of the last image added
var messageCount = 0;

// add an image to the gallery
export function addImage(title, author, url) {
  document.addEventListener("loaded", () => {
    // set the in-document elements
    const currentTitle = document.getElementById("currentPostTitle");
    const currentPostName = document.getElementById("currentPostName");
    const currentImage = document.getElementById("currentImage");
    currentTitle.innerHTML = title;
    currentPostName.innerHTML = author;

    currentImage.src = url;

    const imageID = document.getElementById("imageID");

    lastImageID++;
    imageID.value = lastImageID;
    curImageID = lastImageID;

    // reference to div element, cannot reassign, but objects can still be mutable
    const imageDisplay = document.getElementById("imageDisplay");

    // hard copy
    const imageDisplayCopy = imageDisplay.cloneNode(true);

    imageDisplays[curImageID] = imageDisplayCopy.innerHTML;

    // store in local storage
    localStorage.setItem("imageDisplays", JSON.stringify(imageDisplays));
    localStorage.setItem("lastImageID", lastImageID);
    localStorage.setItem("curImageID", curImageID);

    updateShowHideElements();
  });
}

// delete an image from the gallery given its imageId
export function deleteImage(imageId) {
  document.addEventListener("messagesloaded", () => {
    var keys = Object.keys(imageDisplays);

    let nextKey;
    if (keys.length == 0) {
      nextKey = 0;
    } else {
      nextKey = keys[0];
    }
    //console.log(nextKey);

    nextKey = keys.find((n) => n > imageId);
    if (!nextKey) {
      nextKey = keys[0];
    }

    delete imageDisplays[imageId];
    delete messagesSections[imageId];
    keys = Object.keys(imageDisplays);

    curImageID = nextKey;
    if (keys.length == 0) {
      curImageID = 0;
    }

    if (keys.length > 0) {
      // set the in-document elements
      const imageDisplay = document.getElementById("imageDisplay");
      imageDisplay.innerHTML = imageDisplays[nextKey];
      const messages = document.getElementById("messages");
      messages.innerHTML = messagesSections[nextKey];
    }

    updateShowHideElements();
    deleteCommentListener();

    //TODO
    // update localstorage
    localStorage.setItem("imageDisplays", JSON.stringify(imageDisplays));
    localStorage.setItem("messagesSections", JSON.stringify(messagesSections));
    localStorage.setItem("curImageID", curImageID);
  });
}

// add a comment to an image
export function addComment(imageId, author, content) {
  document.addEventListener("messagesloaded", () => {
    //curImageID = imageId;

    messageCount++;
    const currentDate = new Date();

    // create a new message element
    var elmt = document.createElement("div");
    elmt.className = "message";
    elmt.innerHTML = `
                    <span class="message_arrow">-></span>
                    <span class="message_name">${author}</span>
                    <span class="dateTime">• ${currentDate} </span>
                    <span class="message_id">• ${messageCount}</span>
                    <div class="message_delete"></div>
                    <blockquote class="message_content">${content}</blockquote>                    
                `;

    if (!isEmpty(messagesSections[imageId])) {
      const div = document.createElement("div");
      div.id = "messages";

      div.innerHTML = messagesSections[imageId];
      //console.log(messagesSections[imageId]);
      div.prepend(elmt);

      messagesSections[imageId] = div.innerHTML;
    } else {
      const div = document.createElement("div");
      div.id = "messages";
      div.prepend(elmt);

      messagesSections[imageId] = div.innerHTML;
    }

    //console.log(messages.innerHTML);

    // store in local storage
    localStorage.setItem("messagesSections", JSON.stringify(messagesSections));
    localStorage.setItem("messageCount", messageCount);

    localStorage.setItem("curImageID", curImageID);

    //onsole.log(messagesSections);

    // add delete listeners to delete buttons
    deleteCommentListener();
    updateShowHideElements();
  });
}

// delete a comment to an image
export function deleteComment(commentId) {
  const messages = document.getElementById("messages");

  const mids = document.getElementsByClassName("message_id");

  for (const mid of mids) {
    if (mids.value == commentId) {
      console.log("delete");
      const p = mid.parentNode;
      p.parentNode.removeChild(p);

      messagesSections[curImageID] = messages.innerHTML;

      // store in local storage
      localStorage.setItem(
        "messagesSections",
        JSON.stringify(messagesSections)
      );
    }

    //console.log(messages);

    //console.log(messagesSections);

    updateShowHideElements();
  }
}

//------------------------------------
// unhide image form and hide toggle button
export function unhideImageForm() {
  const toggleButton = document.getElementById("toggleButton");
  const form = document.getElementById("imageForm");

  toggleButton.addEventListener("click", () => {
    if (form.style.display == "none") {
      form.style.display = "block";
      toggleButton.style.display = "none";
    } else {
      form.style.display = "none";
      toggleButton.style.display = "block";
    }
  });
}

// hide other elements if there are 0 or only 1 post
function updateShowHideElements() {
  const keys = Object.keys(imageDisplays);

  // show hide image display
  const prevImageButton = document.getElementById("prevImageButton");
  const nextImageButton = document.getElementById("nextImageButton");

  if (keys.length < 2) {
    prevImageButton.style.display = "none";
    nextImageButton.style.display = "none";
  } else {
    prevImageButton.style.display = "inline";
    nextImageButton.style.display = "inline";
  }

  const imageDisplay = document.getElementById("imageDisplay");
  const imageDisplayButtons = document.getElementById("imageDisplayButtons");
  if (keys.length == 0) {
    imageDisplay.style.display = "none";
    imageDisplayButtons.style.display = "none";
  } else {
    imageDisplay.style.display = "block";
    imageDisplayButtons.style.display = "block";
  }

  // show hide the associated messages section

  const commentForm = document.getElementById("addCommentForm");

  const messageButtons = document.getElementById("messageButtons");

  const messagesSection = document.getElementById("messages");

  if (keys.length == 0) {
    commentForm.style.display = "none";
    messageButtons.style.display = "none";
    messagesSection.style.display = "none";
  } else {
    commentForm.style.display = "block";
    messageButtons.style.display = "block";
    messagesSection.style.display = "block";
  }
}

export function deleteImageButton() {
  document.addEventListener("messagesloaded", () => {
    document
      .getElementById("deleteImageButton")
      .addEventListener("click", function (e) {
        var keys = Object.keys(imageDisplays);

        let nextKey;
        if (keys.length == 0) {
          nextKey = 0;
        } else {
          nextKey = keys[0];
        }
        //console.log(nextKey);

        nextKey = keys.find((n) => n > curImageID);
        if (!nextKey) {
          nextKey = keys[0];
        }

        delete imageDisplays[curImageID];
        delete messagesSections[curImageID];
        keys = Object.keys(imageDisplays);
        //console.log(imageDisplays);
        //console.log(curImageID);

        curImageID = nextKey;
        if (keys.length == 0) {
          curImageID = 0;
        }

        if (keys.length > 0) {
          // set the in-document elements
          const imageDisplay = document.getElementById("imageDisplay");
          imageDisplay.innerHTML = imageDisplays[nextKey];
          const messages = document.getElementById("messages");
          messages.innerHTML = messagesSections[nextKey];
        }
        //console.log(imageDisplays);
        //console.log(keys.length);
        //console.log(curImageID);
        updateShowHideElements();
        deleteCommentListener();

        //TODO
        // update localstorage
        localStorage.setItem("imageDisplays", JSON.stringify(imageDisplays));
        localStorage.setItem(
          "messagesSections",
          JSON.stringify(messagesSections)
        );
        localStorage.setItem("curImageID", curImageID);
      });
  });
}

export function prevImage() {
  document.addEventListener("messagesloaded", () => {
    document
      .getElementById("prevImageButton")
      .addEventListener("click", function (e) {
        const keys = Object.keys(imageDisplays);
        let prevKey;
        if (keys.length == 0) {
          prevKey = 0;
        } else {
          prevKey = keys[keys.length - 1]; // prevkey is last key so you can jump to last element if curimageid is 1
        }
        for (const key in imageDisplays) {
          if (key == curImageID) {
            break;
          }
          prevKey = key;
        }
        curImageID = prevKey;
        if (keys.length == 0) {
          curImageID = 0;
        }

        if (keys.length > 0) {
          // set the in-document elements
          const imageDisplay = document.getElementById("imageDisplay");
          imageDisplay.innerHTML = imageDisplays[prevKey];
        }
        const messages = document.getElementById("messages");
        if (!isEmpty(messagesSections[prevKey])) {
          messages.innerHTML = messagesSections[prevKey];
        } else {
          const div = document.createElement("div");
          div.id = "messages";
          messages.innerHTML = div.innerHTML;
        }

        // console.log(imageDisplays);
        // console.log(keys.length);
        // console.log(curImageID);
        updateShowHideElements();
        deleteCommentListener();
        //TODO
        // update localstorage
        //localStorage.setItem("imageDisplays", JSON.stringify(imageDisplays));

        localStorage.setItem("curImageID", curImageID);
      });
  });
}

export function nextImage() {
  document.addEventListener("messagesloaded", () => {
    document
      .getElementById("nextImageButton")
      .addEventListener("click", function (e) {
        const keys = Object.keys(imageDisplays);

        let nextKey;
        if (keys.length == 0) {
          nextKey = 0;
        } else {
          nextKey = keys[0];
        }
        //console.log(nextKey);

        nextKey = keys.find((n) => n > curImageID);
        if (!nextKey) {
          nextKey = keys[0];
        }
        curImageID = nextKey;
        if (keys.length == 0) {
          curImageID = 0;
        }

        if (keys.length > 0) {
          // set the in-document elements
          const imageDisplay = document.getElementById("imageDisplay");
          imageDisplay.innerHTML = imageDisplays[nextKey];
          const messages = document.getElementById("messages");

          if (!isEmpty(messagesSections[nextKey])) {
            messages.innerHTML = messagesSections[nextKey];
          } else {
            const div = document.createElement("div");
            div.id = "messages";
            messages.innerHTML = div.innerHTML;
          }
        }
        // console.log(imageDisplays);
        // console.log(keys.length);
        // console.log(curImageID);
        updateShowHideElements();
        deleteCommentListener();
        //TODO
        // update localstorage
        localStorage.setItem("curImageID", curImageID);
      });
  });
}

// add an image form listener
export function addImageForm() {
  document.addEventListener("loaded", () => {
    document
      .getElementById("addImageForm")
      .addEventListener("submit", function (e) {
        // prevent from refreshing the page on submit
        e.preventDefault();

        // read form elements
        const name = document.getElementById("image_name").value;
        const title = document.getElementById("image_title").value;
        const url = document.getElementById("image_url").value;
        // clean form
        document.getElementById("addImageForm").reset();

        // set the in-document elements
        const currentTitle = document.getElementById("currentPostTitle");
        const currentPostName = document.getElementById("currentPostName");
        const currentImage = document.getElementById("currentImage");
        currentTitle.innerHTML = title;
        currentPostName.innerHTML = name;

        currentImage.src = url;
        //currentImage.src = 'media/2.jpg';

        const imageID = document.getElementById("imageID");

        //curImageID = parseInt(imageID.dataset.value);

        lastImageID++;
        imageID.value = lastImageID;
        curImageID = lastImageID;

        //console.log(typeof curImageID);

        // reference to div element, cannot reassign, but objects can still be mutable
        const imageDisplay = document.getElementById("imageDisplay");

        // hard copy
        const imageDisplayCopy = imageDisplay.cloneNode(true);

        imageDisplays[curImageID] = imageDisplayCopy.innerHTML;
        //console.log(typeof imageDisplays[curImageID]);

        // store in local storage
        localStorage.setItem("imageDisplays", JSON.stringify(imageDisplays));
        localStorage.setItem("lastImageID", lastImageID);
        localStorage.setItem("curImageID", curImageID);

        //console.log(imageDisplays);

        updateShowHideElements();
      });
  });
}

// add comment form listener
export function addCommentForm() {
  document.addEventListener("messagesloaded", () => {
    document
      .getElementById("addCommentForm")
      .addEventListener("submit", function (e) {
        messageCount++;

        // prevent from refreshing the page on submit
        e.preventDefault();

        // read form elements
        var name = document.getElementById("nameFormInput").value;
        var content = document.getElementById("commentFormInput").value;
        // clean form
        document.getElementById("addCommentForm").reset();

        const currentDate = new Date();

        // create a new message element
        var elmt = document.createElement("div");
        elmt.className = "message";
        elmt.innerHTML = `
                    <span class="message_arrow">-></span>
                    <span class="message_name">${name}</span>
                    <span class="dateTime">• ${currentDate} </span>
                    <span class="message_id">• ${messageCount}</span>
                    <div class="message_delete"></div>
                    <blockquote class="message_content">${content}</blockquote>                    
                `;
        // reference to div element, cannot reassign, but objects can still be mutable
        const messages = document.getElementById("messages");
        messages.prepend(elmt);

        // hard copy
        const messagesCopy = messages.cloneNode(true);

        messagesSections[curImageID] = messagesCopy.innerHTML;

        // store in local storage
        localStorage.setItem(
          "messagesSections",
          JSON.stringify(messagesSections)
        );
        localStorage.setItem("messageCount", messageCount);

        //console.log(messagesSections);

        // add delete listeners to delete buttons
        deleteCommentListener();
        updateShowHideElements();

        //console.log(messagesSections);
      });
  });
}

// retrieve from local storage for message section
export function getMessageSection() {
  window.addEventListener("load", () => {
    const localStored = JSON.parse(localStorage.getItem("messagesSections"));
    //console.log(localStored);

    var evil = {};

    //console.log(keys);

    if (localStored) {
      if (!isEmpty(localStored)) {
        messagesSections = localStored;

        const messages = document.getElementById("messages"); // reference to in document element

        if (curImageID) {
          messageCount = parseInt(localStorage.getItem("messageCount"));

          // console.log("here");
          // console.log(curImageID);
          // console.log(messagesSections[curImageID]);

          if (!isEmpty(messagesSections[curImageID])) {
            messages.innerHTML = messagesSections[curImageID];
          }

          localStorage.setItem(
            "messagesSections",
            JSON.stringify(messagesSections)
          );
          localStorage.setItem("messageCount", messageCount);
        }
      }
    }

    updateShowHideElements();
    deleteCommentListener();

    //console.log(localStored);
    document.dispatchEvent(new Event("messagesloaded"));
    //console.log("messages loaded");
  });
}

// retrieve from local storage for image display
export function getImageDisplay() {
  window.addEventListener("load", () => {
    const localStored = JSON.parse(localStorage.getItem("imageDisplays"));
    //console.log(typeof localStored);
    if (localStored) {
      var evil = {};

      //console.log(keys);
      if (!isEmpty(localStored)) {
        imageDisplays = localStored;

        const imageDisplay = document.getElementById("imageDisplay"); // reference to in document element

        //console.log(curImageID);
        curImageID = parseInt(localStorage.getItem("curImageID"));
        lastImageID = parseInt(localStorage.getItem("lastImageID"));
        //console.log(typeof curImageID);

        //console.log(imageDisplay);
        //console.log(curImageID);

        if (curImageID) {
          imageDisplay.innerHTML = imageDisplays[curImageID]; // set it to the current image
          // console.log(imageDisplays[curImageID]);
        }

        // store in local storage
        localStorage.setItem("imageDisplays", JSON.stringify(imageDisplays));
        localStorage.setItem("lastImageID", lastImageID);
        localStorage.setItem("curImageID", curImageID);
      }
    }

    updateShowHideElements();

    //console.log(localStored);
    document.dispatchEvent(new Event("loaded"));
  });
}

function deleteCommentListener() {
  const messages = document.getElementById("messages");

  const buttons = document.getElementsByClassName("message_delete");

  for (const button of buttons) {
    button.addEventListener("click", function (e) {
      console.log("delete");
      const p = button.parentNode;
      p.parentNode.removeChild(p);

      messagesSections[curImageID] = messages.innerHTML;

      // store in local storage
      localStorage.setItem(
        "messagesSections",
        JSON.stringify(messagesSections)
      );

      //console.log(messages);

      //console.log(messagesSections);

      updateShowHideElements();
    });
  }
}

function isEmpty(value) {
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    (typeof value === "object" && Object.keys(value).length === 0)
  );
}
