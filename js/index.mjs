import {
  unhideImageForm,
  addImage,
  addImageForm,
  getImageDisplay,
  deleteImage,
  prevImage,
  nextImage,
  addComment,
  getMessageSection,
  addCommentForm,
  deleteImageButton,

} from "./api.mjs";

getImageDisplay();
getMessageSection();

addCommentForm();
addImageForm();

//---------
addImage("Title", "Alice", "media/1.jpg");
//addImage('Title', 'Bob', 'media/2.jpg');

addComment(1, "Bob", "Comment section");
// addComment(1, 'Bob', 'Another comment');

//deleteImage(1);

//-----------

unhideImageForm();

deleteImageButton();

nextImage();
prevImage();
