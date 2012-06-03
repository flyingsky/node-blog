/**
 * Created by IntelliJ IDEA.
 * User: ramon
 * Date: 5/19/12
 * Time: 5:29 PM
 * To change this template use File | Settings | File Templates.
 */
(function($){
    $.tableUtils = {};
    $.tableUtils.createTableHtml = function (objs, settings) {
        var htmlBuffer = ["<table>"];
        if (!objs) {
            return [];
        }

        if (!$.isArray(objs)) {
            objs = [objs];
        }

        if (!settings) {
            settings = {
                headers: [],
                headerNames: []
            };
            var obj = objs.length > 0 ? objs[0] : {};
            for (var p in obj) {
                settings.headers.push(p);
                settings.headerNames.push(p);
            }
        } else {
            if (!settings.headerNames)
            {
                settings.headerNames = settings.headerNames;
            }
        }

        htmlBuffer.push("<tr>");
        $.each(settings.headerNames, function(index, headerName){
            htmlBuffer.push("<th>" + headerName + "</th>")
        });
        htmlBuffer.push("</tr>");

        $.each(objs, function(index, obj) {
            htmlBuffer.push("<tr>");
            $.each(settings.headers, function(index, headerProperty){
                htmlBuffer.push("<td>" + obj[headerProperty] + "</td>");
            });
            htmlBuffer.push("</tr>");
        });
        htmlBuffer.push('</table>');
        return htmlBuffer.join('');
    };
})(jQuery);

(function($){
    $.fn.ajaxExpandable = function(url, successCallback, errorCallback){
        var table = this;
        table.find("tr").addClass("odd");
        table.find("tr:first-child").removeClass("odd");

        var defaultSuccessCallback = function(detailRow, data){
            var tableHtml = $.tableUtils.createTableHtml(data);
            detailRow.append("<td colspan='5'>" + tableHtml + "</td>");
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
                url: url(summaryRow),
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

(function($){
    var defaultLoadPage = function(url, pageIndex, pageSize) {
        console.log(url + '/' + pageIndex + '/' + pageSize);
    };
    
    var updateNavBtnState = function(navBtns, currentPage) {
        if (currentPage == 0) {
            $(navBtns).find('#first').attr('disabled', true);
        }
    };

    $.fn.pagable = function(settings) {
        if (!settings) {
            settings = {};
        }

        settings.pageIndex = settings.pageIndex === undefined ? 0 : settings.pageIndex;
        settings.pageSize = settings.pageSize === undefined ? 10 : settings.pageSize;
        settings.loadPage = settings.loadPage || defaultLoadPage;

        var table = this;
        var buffer = ["<div class='pager'>"];

        var navBtnHtml = '<button id="{id}">{text}</button>';
        var navHtmlObjs = [{
            id: 'first',
            text: 'First'
        }, {
            id: 'previous',
            text: 'Previous'
        }, {
            id: 'next',
            text: 'Next'
        }, {
            id: 'last',
            text: 'Last'
        }];
        $.each(navHtmlObjs, function(index, navHtmlObj){
            buffer.push($.format(navBtnHtml, navHtmlObj, true));
        });
        buffer.push("</div>");

        var pager = $(buffer.join(''));
        var navBtns = pager.find("button");
        $.each(navBtns, function(index, navBtn) {
            $(navBtn).click(function() {
                if (settings.loadPage) {
                    settings.loadPage(settings.url, settings.pageIndex, settings.pageSize);
                }
            });
        });
        updateNavBtnState(navBtns, settings.pageIndex);
        table.after(pager);
        pager.width(table.width());
    }
})(jQuery);