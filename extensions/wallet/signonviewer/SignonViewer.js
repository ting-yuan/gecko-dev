    /* for localization */
    var Bundle = srGetStrBundle("chrome://wallet/locale/SignonViewer.properties");
    var logonsSavedTab = Bundle.GetStringFromName("logonsSavedTab");
    var logonsNotSavedTab = Bundle.GetStringFromName("logonsNotSavedTab");
    var formsNotPreviewedTab = Bundle.GetStringFromName("formsNotPreviewedTab");
    var formsNotSavedTab = Bundle.GetStringFromName("formsNotSavedTab");
    var logonsSaved = Bundle.GetStringFromName("logonsSaved");
    var siteUsername = Bundle.GetStringFromName("siteUsername");
    var logonsNotSaved = Bundle.GetStringFromName("logonsNotSaved");
    var formsNotPreviewed = Bundle.GetStringFromName("formsNotPreviewed");
    var formsNotSaved = Bundle.GetStringFromName("formsNotSaved");
    var removeCmdLabel = Bundle.GetStringFromName("removeCmdLabel");
    var okCmdLabel = Bundle.GetStringFromName("okCmdLabel");
    var cancelCmdLabel = Bundle.GetStringFromName("cancelCmdLabel");

    /* for xpconnect */

    var signonviewer =
      Components.classes
        ["component://netscape/signonviewer/signonviewer-world"].createInstance();
    signonviewer = signonviewer.QueryInterface(Components.interfaces.nsISignonViewer);

    function DoGetSignonList()
    {
      return signonviewer.GetSignonValue();
    }

    function DoGetRejectList()
    {
      return signonviewer.GetRejectValue();
    }

    function DoGetNopreviewList()
    {
      return signonviewer.GetNopreviewValue();
    }

    function DoGetNocaptureList()
    {
      return signonviewer.GetNocaptureValue();
    }

    function DoSave(value)
    {
      signonviewer.SetValue(value, window);
    }

    /* end of xpconnect stuff */

    index_frame = 0;
    title_frame = 1;
    spacer1_frame = 2;
    list_frame = 3;
    spacer2_frame = 4;
    button_frame = 5;

    var signon_mode;
    var signonList = [];
    var rejectList =  [];
    var nopreviewList =  [];
    var nocaptureList =  [];
    deleted_signons = new Array;
    deleted_rejects = new Array;
    deleted_nopreviews = new Array;
    deleted_nocaptures = new Array;

    function DeleteItemSelected() {
      if (signon_mode == 0) {
        DeleteSignonSelected();
      } else if (signon_mode == 1) {
        DeleteRejectSelected();
      } else if (signon_mode == 2) {
        DeleteNopreviewSelected();
      } else if (signon_mode == 3) {
        DeleteNocaptureSelected();
      }
    }

    function DeleteSignonSelected() {
      selname = top.frames[list_frame].document.fSelectSignon.selname;
      goneS = top.frames[button_frame].document.buttons.goneS;
      var p;
      var i;
      for (i=selname.options.length; i>0; i--) {
        if (selname.options[i-1].selected) {
          selname.options[i-1].selected = 0;
          goneS.value = goneS.value + selname.options[i-1].value + ",";
          deleted_signons[selname.options[i-1].value] = 1;
          selname.remove(i-1);
        }
      }
    }

    function DeleteRejectSelected() {
      selname = top.frames[list_frame].document.fSelectReject.selname;
      goneR = top.frames[button_frame].document.buttons.goneR;
      var p;
      var i;
      for (i=selname.options.length; i>0; i--) {
        if (selname.options[i-1].selected) {
          selname.options[i-1].selected = 0;
          goneR.value = goneR.value + selname.options[i-1].value + ",";
          deleted_rejects[selname.options[i-1].value] = 1;
          selname.remove(i-1);
        }
      }
    }

    function DeleteNopreviewSelected() {
      selname = top.frames[list_frame].document.fSelectNopreview.selname;
      goneP = top.frames[button_frame].document.buttons.goneP;
      var p;
      var i;
      for (i=selname.options.length; i>0; i--) {
        if (selname.options[i-1].selected) {
          selname.options[i-1].selected = 0;
          goneP.value = goneP.value + selname.options[i-1].value + ",";
          deleted_nopreviews[selname.options[i-1].value] = 1;
          selname.remove(i-1);
        }
      }
    }

    function DeleteNocaptureSelected() {
      selname = top.frames[list_frame].document.fSelectNocapture.selname;
      goneC = top.frames[button_frame].document.buttons.goneC;
      var p;
      var i;
      for (i=selname.options.length; i>0; i--) {
        if (selname.options[i-1].selected) {
          selname.options[i-1].selected = 0;
          goneC.value = goneC.value + selname.options[i-1].value + ",";
          deleted_nocaptures[selname.options[i-1].value] = 1;
          selname.remove(i-1);
        }
      }
    }

    function loadSignons(){
      signon_mode = 0;
      top.frames[index_frame].document.open();
      top.frames[index_frame].document.write(
        "<body bgcolor='#c0c0c0'>" +
          "<table border=0 width='100%'>" +
            "<tr>" +
              "<td align='center' valign='middle' bgcolor='#ffffff'>" +
                "<font size='2' color='#666666'>" +
                  "<b>" + logonsSavedTab + "</b>" +
                "</font>" +
              "</td>" +
              "<td align='center' valign='middle' bgcolor='#c0c0c0'>" +
                "<a onclick='top.loadRejects();' href=''>" +
                  "<font size='2'>" + logonsNotSavedTab + "</font>" +
                "</a>" +
              "</td>" +
//          "</tr>" +
//          "<tr>" +
              "<td align='center' valign='middle' bgcolor='#c0c0c0'>" +
                "<a onclick='top.loadNopreviews();' href=''>" +
                  "<font size='2'>" + formsNotPreviewedTab + "</font>" +
                "</a>" +
              "</td>" +
//            "<td align='center' valign='middle' bgcolor='#c0c0c0'>" +
//              "<a onclick='top.loadNocaptures();' href=''>" +
//                "<font size='2'>" + formsNotSavedTab + "</font>" +
//              "</a>" +
//            "</td>" +
            "<td>&nbsp;&nbsp;&nbsp;</td>" +
            "</tr>" +
          "</table>" +
        "</body>"
      );
      top.frames[index_frame].document.close();

      top.frames[title_frame].document.open();
      top.frames[title_frame].document.write
        ("&nbsp;" + logonsSaved + "");
      top.frames[title_frame].document.close();

      loadSignonsList();
    }

    function loadSignonsList(){
      top.frames[list_frame].document.open();
      top.frames[list_frame].document.write(
        "<form name='fSelectSignon'>" +
          "<p>" +
            "<b>" + siteUsername + "</b>" +
            "<table border='0'>" +
              "<tr>" +
                "<td width='100%' valign='top'>" +
                  "<center>" +
                    "<p>" +
                      "<select name='selname' size='10' multiple='multiple'> "
      );
      for (i=1; !(i>=signonList.length); i++) {
        if (!deleted_signons[i-1]) {
          top.frames[list_frame].document.write(signonList[i]);
        }
      }
      top.frames[list_frame].document.write(
                      "</select>" +
                    "</p>" +
                  "</center>" +
                "</td>" +
              "</tr>" +
            "</table>" +
          "</p>" +
        "</form>"
      );
      top.frames[list_frame].document.close();
    }

    function loadRejects(){
      signon_mode = 1;
      top.frames[index_frame].document.open();
      top.frames[index_frame].document.write(
        "<body bgcolor='#c0c0c0'>" +
          "<table border='0' width='100%'>" +
            "<tr>" +
              "<td align='center' valign='middle' bgcolor='#c0c0c0'>" +
                "<a onclick='top.loadSignons();' href=''>" +
                  "<font size='2'>" + logonsSavedTab + "</font>" +
                "</a>" +
              "</td>" +
              "<td align='center' valign='middle' bgcolor='#ffffff'>" +
                "<font size='2' color='#666666'>" +
                  "<b>" + logonsNotSavedTab + "</b>" +
                "</font>" +
              "</td>" +
              "<td>&nbsp;&nbsp;&nbsp;</td>" +
//          "</tr>" +
//          "<tr>" +
              "<td align='center' valign='middle' bgcolor='#c0c0c0'>" +
                "<a onclick='top.loadNopreviews();' href=''>" +
                  "<font size='2'>" + formsNotPreviewedTab + "</font>" +
                "</a>" +
              "</td>" +
//            "<td align='center' valign='middle' bgcolor='#c0c0c0'>" +
//              "<a onclick='top.loadNocaptures();' href=''>" +
//                "<font size='2'>" + formsNotSavedTab + "</font>" +
//              "</a>" +
//            "</td>" +
              "<td>&nbsp;&nbsp;&nbsp;</td>" +
            "</tr>" +
          "</table>" +
        "</body>"
      );
      top.frames[index_frame].document.close();

      top.frames[title_frame].document.open();
      top.frames[title_frame].document.write
        ("&nbsp;" + logonsNotSaved + "");
      top.frames[title_frame].document.close();

      loadRejectsList();
    }

    function loadRejectsList(){
      top.frames[list_frame].document.open();
      top.frames[list_frame].document.write(
        "<form name='fSelectReject'>" +
          "<p>" +
            "<table border='0'>" +
              "<tr>" +
                "<td width='100%' valign='top'>" +
                  "<center>" +
                    "<p>" +
                      "<select name='selname' size='10' multiple='multiple'> "
      );
      for (i=1; !(i>=rejectList.length); i++) {
        if (!deleted_rejects[i-1]) {
          top.frames[list_frame].document.write(rejectList[i]);
        }
      }
      top.frames[list_frame].document.write(
                      "</select>" +
                    "</p>" +
                  "</center>" +
                "</td>" +
              "</tr>" +
            "</table>" +
          "</p>" +
        "</form>"
      );
      top.frames[list_frame].document.close();
    }

    function loadNopreviews(){
      signon_mode = 2;
      top.frames[index_frame].document.open();
      top.frames[index_frame].document.write(
        "<body bgcolor='#c0c0c0'>" +
          "<table border='0' width='100%'>" +
            "<tr>" +
              "<td align='center' valign='middle' bgcolor='#c0c0c0'>" +
                "<a onclick='top.loadSignons();' href=''>" +
                  "<font size='2'>" + logonsSavedTab + "</font>" +
                "</a>" +
              "</td>" +
              "<td align='center' valign='middle' bgcolor='#c0c0c0'>" +
                "<a onclick='top.loadRejects();' href=''>" +
                  "<font size='2'>" + logonsNotSavedTab + "</font>" +
                "</a>" +
              "</td>" +
//          "</tr>" +
//          "<tr>" +
              "<td align='center' valign='middle' bgcolor='#ffffff'>" +
                "<font size='2' color='#666666'>" +
                  "<b>" + formsNotPreviewedTab + "</b>" +
                "</font>" +
              "</td>" +
//            "<td align='center' valign='middle' bgcolor='#c0c0c0'>" +
//              "<a onclick='top.loadNocaptures();' href=''>" +
//                "<font size='2'>" + formsNotSavedTab + "</font>" +
//              "</a>" +
//            "</td>" +
              "<td>&nbsp;&nbsp;&nbsp;</td>" +
            "</tr>" +
          "</table>" +
        "</body>"
      );
      top.frames[index_frame].document.close();

      top.frames[title_frame].document.open();
      top.frames[title_frame].document.write
        ("&nbsp;" + formsNotPreviewed + "");
      top.frames[title_frame].document.close();

      loadNopreviewsList();
    }

    function loadNopreviewsList(){
      top.frames[list_frame].document.open();
      top.frames[list_frame].document.write(
        "<form name='fSelectNopreview'>" +
          "<p>" +
            "<table border='0'>" +
              "<tr>" +
                "<td width='100%' valign='top'>" +
                  "<center>" +
                    "<p>" +
                      "<select name='selname' size='10' multiple='multiple'> "
      );
      for (i=1; !(i>=nopreviewList.length); i++) {
        if (!deleted_nopreviews[i-1]) {
          top.frames[list_frame].document.write(nopreviewList[i]);
        }
      }
      top.frames[list_frame].document.write(
                      "</select>" +
                    "</p>" +
                  "</center>" +
                "</td>" +
              "</tr>" +
            "</table>" +
          "</p>" +
        "</form>"
      );
      top.frames[list_frame].document.close();
    }

    function loadNocaptures(){
      signon_mode = 3;
      top.frames[index_frame].document.open();
      top.frames[index_frame].document.write(
        "<body bgcolor='#c0c0c0'>" +
          "<table border='0' width='100%'>" +
            "<tr>" +
              "<td align='center' valign='middle' bgcolor='#c0c0c0'>" +
                "<a onclick='top.loadSignons();' href=''>" +
                  "<font size='2'>" + logonsSavedTab + "</font>" +
                "</a>" +
              "</td>" +
              "<td align='center' valign='middle' bgcolor='#c0c0c0'>" +
                "<a onclick='top.loadRejects();' href=''>" +
                  "<font size='2'>" + logonsNotSavedTab + "</font>" +
                "</a>" +
              "</td>" +
            "</tr>" +
            "<tr>" +
              "<td align='center' valign='middle' bgcolor='#c0c0c0'>" +
                "<a onclick='top.loadNopreviews();' href=''>" +
                  "<font size='2'>" + formsNotPreviewedTab + "</font>" +
                "</a>" +
              "</td>" +
              "<td align='center' valign='middle' bgcolor='#ffffff'>" +
                "<font size='2' color='#666666'>" +
                  "<b>" + formsNotSavedtab + "</b>" +
                "</font>" +
              "</td>" +
              "<td>&nbsp;&nbsp;&nbsp;</td>" +
            "</tr>" +
          "</table>" +
        "</body>"
      );
      top.frames[index_frame].document.close();

      top.frames[title_frame].document.open();
      top.frames[title_frame].document.write
        ("&nbsp;" + formsNotSaved + "");
      top.frames[title_frame].document.close();

      loadNocapturesList();
    }

    function loadNocapturesList(){
      top.frames[list_frame].document.open();
      top.frames[list_frame].document.write(
        "<form name='fSelectNocapture'>" +
          "<p>" +
            "<table border='0'>" +
              "<tr>" +
                "<td width='100%' valign='top'>" +
                  "<center>" +
                    "<p>" +
                      "<select name='selname' size='10' multiple='multiple'> "
      );
      for (i=1; !(i>=nocaptureList.length); i++) {
        if (!deleted_nocaptures[i-1]) {
          top.frames[list_frame].document.write(nocaptureList[i]);
        }
      }
      top.frames[list_frame].document.write(
                      "</select>" +
                    "</p>" +
                  "</center>" +
                "</td>" +
              "</tr>" +
            "</table>" +
          "</p>" +
       "</form>"
      );
      top.frames[list_frame].document.close();
    }

    function loadButtons(){
      top.frames[button_frame].document.open();
      top.frames[button_frame].document.write(
        "<form name='buttons'>" +
          "<br/>" +
          "&nbsp;" +
          "<button onclick='top.DeleteItemSelected();'>" + removeCmdLabel + "</button>" +
          "<div align='right'>" +
            "<button onclick='parent.Save();'>" + okCmdLabel + "</button>" +
            " &nbsp;&nbsp;" +
            "<button onclick='parent.Cancel();'>" + cancelCmdLabel + "</button>" +
          "</div>" +
          "<input type='hidden' name='goneS' value='' size='-1'/>" +
          "<input type='hidden' name='goneR' value='' size='-1'/>" +
          "<input type='hidden' name='goneP' value='' size='-1'/>" +
          "<input type='hidden' name='goneC' value='' size='-1'/>" +
          "<input type='hidden' name='signonList' value='' size='-1'/>" +
          "<input type='hidden' name='rejectList' value='' size='-1'/>" +
        "</form>"
      );
      top.frames[button_frame].document.close();
    }

    function loadFrames(){
      list = DoGetSignonList();
      BREAK = list[0];
      signonList = list.split(BREAK);
      list = DoGetRejectList();
      BREAK = list[0];
      rejectList = list.split(BREAK);
      list = DoGetNopreviewList();
      BREAK = list[0];
      nopreviewList = list.split(BREAK);
      list = DoGetNocaptureList();
      BREAK = list[0];
      nocaptureList = list.split(BREAK);
      loadSignons();
      loadButtons();
    }

    function Save(){
      var goneS = top.frames[button_frame].document.buttons.goneS;
      var goneR = top.frames[button_frame].document.buttons.goneR;
      var goneP = top.frames[button_frame].document.buttons.goneP;
      var goneC = top.frames[button_frame].document.buttons.goneC;
      var result = "|goneS|"+goneS.value+"|goneR|"+goneR.value;
      result += "|goneC|"+goneC.value+"|goneP|"+goneP.value+"|";
      DoSave(result);
    }

    function Cancel(){
      var result = "|goneS||goneR||goneC||goneP||";
      DoSave(result);
    }
