/*
 * Created by ALL-INKL.COM - Neue Medien Muennich - 04. Feb 2014
 * Licensed under the terms of GPL, LGPL and MPL licenses.
 */
CKEDITOR.dialog.add("base64imageDialog", function(editor){
	
	var t = null,
		selectedImg = null,
		orgWidth = null, orgHeight = null,
		imgPreview = null, urlCB = null, urlI = null, fileCB = null, imgScal = 1, lock = true;
	
	/* Check File Reader Support */
	function fileSupport() {
		var r = false, n = null;
		try {
			if(FileReader) {
				var n = document.createElement("input");
				if(n && "files" in n) r = true;
			}
		} catch(e) { r = false; }
		n = null;
		return r;
	}
	var fsupport = fileSupport();
	
	/* Load preview image */
	function imagePreviewLoad(s) {
		
		/* no preview */
		if(typeof(s) != "string" || !s) {
			imgPreview.getElement().setHtml("");
			return;
		}
		
		/* Create image */
		var i = new Image();
		
		/* Display loading text in preview element */
		imgPreview.getElement().setHtml("Loading...");
		
		/* When image is loaded */
		i.onload = function() {
			
			/* Remove preview */
			imgPreview.getElement().setHtml("");
			
			/* Set attributes */
			if(orgWidth == null || orgHeight == null) {
				// t.setValueOf("tab-properties", "width", this.width);
				// t.setValueOf("tab-properties", "height", this.height);
				imgScal = 1;
				if(this.height > 0 && this.width > 0) imgScal = this.width / this.height;
				if(imgScal <= 0) imgScal = 1;
			} else {
				orgWidth = null;
				orgHeight = null;
			}
			this.id = editor.id+"previewimage";
			this.setAttribute("style", "max-width:400px;max-height:100px;");
			this.setAttribute("alt", "");
			
			/* Insert preview image */
			try {
				var p = imgPreview.getElement().$;
				if(p) p.appendChild(this);
			} catch(e) {}
			
		};
		
		/* Error Function */
		i.onerror = function(){ imgPreview.getElement().setHtml(""); };
		i.onabort = function(){ imgPreview.getElement().setHtml(""); };
		
		/* Load image */
		i.src = s;
	}
	
	/* Change input values and preview image */
	function imagePreview(src){
		
		/* Remove preview */
		imgPreview.getElement().setHtml("");
		
		if(src == "base64") {
			
			/* Disable Checkboxes */
			if(urlCB) urlCB.setValue(false, true);
			if(fileCB) fileCB.setValue(false, true);
			
		} else if(src == "url") {
			
			/* Ensable Image URL Checkbox */
			if(urlCB) urlCB.setValue(true, true);
			if(fileCB) fileCB.setValue(false, true);
			
			/* Load preview image */
			if(urlI) imagePreviewLoad(urlI.getValue());
			
		} else if(fsupport) {
			
			/* Ensable Image File Checkbox */
			if(urlCB) urlCB.setValue(false, true);
			if(fileCB) fileCB.setValue(true, true);
			
			/* Read file and load preview */
			var fileI = t.getContentElement("tab-source", "file");
			var n = null;
			try { n = fileI.getInputElement().$; } catch(e) { n = null; }
			if(n && "files" in n && n.files && n.files.length > 0 && n.files[0]) {
				if("type" in n.files[0] && !n.files[0].type.match("image.*")) return;
				if(!FileReader) return;
				imgPreview.getElement().setHtml("Loading...");
				var fr = new FileReader();
				fr.onload = (function(f) { return function(e) {
					imgPreview.getElement().setHtml("");
					imagePreviewLoad(e.target.result);
				}; })(n.files[0]);
				fr.onerror = function(){ imgPreview.getElement().setHtml(""); };
				fr.onabort = function(){ imgPreview.getElement().setHtml(""); };
				fr.readAsDataURL(n.files[0]);
			}
		}
	};
	
  /* Set integer Value */
  function integerValue(elem) {
    var v = elem.getValue(), u = "";
    if(v.indexOf("%") >= 0) u = "%";
    v = parseInt(v, 10);
    if(isNaN(v)) v = 0;
    elem.setValue(v+u);
  }

	if(fsupport) {
		
		/* Dialog with file and url image source */
		var sourceElements = [
			{
				type: "hbox",
				widths: ["70px"],
				children: [
					{
						type: "checkbox",
						id: "urlcheckbox",
						style: "margin-top:5px",
						label: editor.lang.common.url+":"
					},
					{
						type: "text",
						id: "url",
						label: "",
						onChange: function(){ imagePreview("url"); }
					}
				]
			},
			{
				type: "hbox",
				widths: ["70px"],
				children: [
					{
						type: "checkbox",
						id: "filecheckbox",
						style: "margin-top:5px",
						label: editor.lang.common.upload+":"
					},
					{
						type: "file",
						id: "file",
            label: "",
            onClick: function () {
              var input = this.getInputElement();
              input.$.accept = 'image/*';
            },
						onChange: function(){ imagePreview("file"); }
					}
				]
      },
      
      {
				type: "hbox",
				children: [
					{
            type: "text",
            id: "width",
            width: "200px",
            label: "Width of image in percentage:"
          }
				]
			},
      {
        type:"html",
        html: "<p>Please wait for image to load in the preview window before clicking 'OK'. </p>"
      },
			{
				type: "html",
				id: "preview",
				html: new CKEDITOR.template("<div style=\"text-align:center;\"></div>").output()
			}
		];
		
	} else {
		
		/* Dialog with url image source */
		var sourceElements = [
			{
				type: "text",
				id: "url",
				label: editor.lang.common.url,
				onChange: function(){ imagePreview("url"); }
			},
			{
				type: "html",
				id: "preview",
				html: new CKEDITOR.template("<div style=\"text-align:center;\"></div>").output()
			}
		];
	}
	
	/* Dialog */
    return {
		title: editor.lang.common.image,
        minWidth: 450,
        minHeight: 180,
		onLoad: function(){
			
			if(fsupport) {
				
				/* Get checkboxes */
				urlCB = this.getContentElement("tab-source", "urlcheckbox");
				fileCB = this.getContentElement("tab-source", "filecheckbox");
				
				/* Checkbox Events */
				urlCB.getInputElement().on("click", function(){ imagePreview("url"); });
				fileCB.getInputElement().on("click", function(){ imagePreview("file"); });
				
			}
			
			/* Get url input element */
			urlI = this.getContentElement("tab-source", "url");
			
			/* Get image preview element */
      imgPreview = this.getContentElement("tab-source", "preview");

      /* get attribute properties */
      this.getContentElement("tab-source", "width").getInputElement().on("keyup", function(){ integerValue(this); }, this.getContentElement("tab-source", "width"));
      
		},
		onShow: function(){
			
			/* Remove preview */
			imgPreview.getElement().setHtml("");
			
			t = this, orgWidth = null, orgHeight = null, imgScal = 1, lock = true;
			
			/* selected image or null */
			selectedImg = editor.getSelection();
			if(selectedImg) selectedImg = selectedImg.getSelectedElement();
      if(!selectedImg || selectedImg.getName() !== "img") selectedImg = null;
      
      /* set default width of image */
      t.setValueOf("tab-source", "width", "100");
			
		},
		onOk : function(){
			
			/* Get image source */
			var src = "";
			try { src = CKEDITOR.document.getById(editor.id+"previewimage").$.src; } catch(e) { src = ""; }
			if(typeof(src) != "string" || src == null || src === "") return;
			
			/* selected image or new image */
			if(selectedImg) var newImg = selectedImg; else var newImg = editor.document.createElement("img");
			newImg.setAttribute("src", src);
      src = null;
      
      // Get the width
      var widthPercentage = t.getValueOf("tab-source", "width");
			
      newImg.setAttribute("style", `width:${widthPercentage}%;height:100%`);
			
			/* Insert new image */
			if(!selectedImg) editor.insertElement(newImg);
			
			/* Resize image */
			if(editor.plugins.imageresize) editor.plugins.imageresize.resize(editor, newImg, 800, 800);
			
		},
		
		/* Dialog form */
        contents: [
            {
                id: "tab-source",
                label: editor.lang.common.generalTab,
                elements: sourceElements
            }
        ]
    };
});
