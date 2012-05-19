/**
 * Created by IntelliJ IDEA.
 * User: ramon
 * Date: 5/19/12
 * Time: 5:29 PM
 * To change this template use File | Settings | File Templates.
 */
(function($){
    $.fn.ajaxExpand = function(url, successCallback, errorCallback){
        var table = $(this);
        table.find("tr").addClass("odd");
        table.find("tr:first-child").removeClass("odd");

        var defaultSuccessCallback = function(detailRow, data){
            var header = "<tr>";
            var rowData = "<tr>";
            for (var p in data) {
                header += "<th>" + p + "</th>";
                rowData += "<td>" + data[p] + "</td>";
            }
            header += "</tr>";
            rowData += "</tr>";
            var table = "<table>" + header + rowData + "</table>";
            detailRow.append(table);
        };

        successCallback = successCallback || defaultSuccessCallback;

        var defaultErrorCallback = function(detailRow, jqXHR, textStatus, errorThrown){
            detailRow.append("<td>" + (textStatus ? textStatus.toUpperCase() : "") + ", " + (errorThrown ? errorThrown : "") + "</td>");
        };

        errorCallback = errorCallback || defaultErrorCallback;

        table.find("tr.odd").click(function(){
            var summaryRow = $(this);
            var detailRow = summaryRow.next("tr");
            if (!detailRow || detailRow.length == 0 || detailRow.hasClass("odd")) {
                detailRow = $("<tr></tr>");
                summaryRow.after(detailRow);
            }

            summaryRow.find(".arrow").toggleClass("up");

            if(!detailRow.attr('loading') && !detailRow.attr('loaded')){
                detailRow.append("<td colspan='5'>Loading</td>");
            }
            else {
                detailRow.toggle();
            }

            if (detailRow.attr('loaded')) {
                return;
            }

            detailRow.attr('loading', true);
            $.ajax({
                url: "/s/" + summaryRow.find("td:first").text(),
                dataType: 'json',
                success: function (data) {
                    detailRow.attr('loaded', true);
                    detailRow.empty();
                    successCallback(detailRow, data);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    detailRow.attr('loaded', true);
                    detailRow.empty();
                    errorCallback(detailRow, jqXHR, textStatus, errorThrown);
                }
            });
        });
    }
})(jQuery);