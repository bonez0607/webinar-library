//Update 6-01-17 by Joseph Banegas
/* 
  	- Can now And/Or filter with multiple sets of checkboxes
	- No results and Please make selection have been added
	- Checkbox functions condensed to one function to easily add new filters 
	- itemCount() added to provide counts of beside respective checkboxes.
	- releases 'sticky' when #about touches filters
*/
/* global $ */

$(document).ready(function() {

	/*
	|-----------------------------------------------------------
	|  jquery Cache Selectors
	|-----------------------------------------------------------
	*/
	
	const $table = $('table');
	const $fixed = $(".fixed");
	const $webinar = $(".webinar");
	const $noResults = $(".no-results");
	const $makeSelection = $(".make-selection");

	/*
	|-----------------------------------------------------------
	|  Webinar Item Constructor
	|-----------------------------------------------------------
	|   * assigns the appropriate properties to each Webinar entry
	*/

	function checkDefault() {
		var $checkBoxes = $("#checkboxes input[type='checkbox']");
		if (!$checkBoxes.is(":checked", false)) {
			$checkBoxes.prop("checked", true);
		}
	}

	function rowClick() {
		$webinar.click(function() {
				window.location = $(this).find('a').prop('href');
			})
			.hover(function() {
				$(this).toggleClass('hover').css('cursor', 'pointer');
			});
	}

	/*
	|-----------------------------------------------------------
	|  Add Checkboxes
	|-----------------------------------------------------------
	*/
function addChkBx($filterClass) {
    //Creates array from CSS class innerHTML values then removes duplicates
    let mappedArr = $.makeArray($filterClass.map(function(index, item) {
        ///checks if parameter is a number. if true makes integer
        if (!isNaN(item.innerHTML)) { 
            return +item.innerHTML;
        }

        return item.innerHTML;
    }));

    let $filteredArr = mappedArr.filter(function(item, index, self) {
        return self.indexOf(item) === index;
    })

    ///checks if array contains num
    var isNumericString = $filteredArr.filter(function(i) {
        return !isNaN(i);
    }).length > 0;

    if (isNumericString) {          
        $filteredArr = $filteredArr.sort(function(a, b) {
            return a - b; ///if true sort normally
        });
        $filteredArr.forEach(function(item) {
            console.log(item);
            return $fixed.prepend("<label>" + "<input type='checkbox' name='" + $filterClass[0].className + "' value='" + item + "'/>" + item + "<span style='font-size:10px; padding:0; margin:0;'>(" + itemCount(mappedArr, item) + ")</span>" + "</label>");
        });
    } else {
        $filteredArr = $filteredArr.sort(function(a, b) {
            if (a < b) { ///if true sort reverse alphabetically
                return 1;
            } else if (a > b) {
                return -1;
            }
            return 0;
        });

        $filteredArr.forEach(function(item) {
            console.log(item);
            return $fixed.prepend("<label>" + "<input type='checkbox' name='" + $filterClass[0].className + "' value='" + item.toLowerCase().replace(/\s+/g, '-') + "'/>" + item + "<span style='font-size:10px; padding:0; margin:0;'>(" + itemCount(mappedArr, item) + ")</span>" + "</label>");
        });
    }

    //Creates title for checkbox groups
    $fixed.prepend("<br /><h2>Filter by " + $filterClass[0].className.charAt(0).toLocaleUpperCase() + $filterClass[0].className.slice(1) + "</h2>");
}

	///Add chkbx by calling class
	addChkBx($('.year'));
	addChkBx($('.practice'));

	/*
	|-----------------------------------------------------------
	|  Counter Functions
	|-----------------------------------------------------------
	*/
	function itemCount(arr, el) {
		let count = {};
		arr.forEach(function(item){
			count[item] = count[item] ? count[item] + 1 : 1;
		});
		return count[el];
	}

	function addCounter() {
		const totCount = $('#webinar tr').length - 2; 
		const visibleRow = $("tbody tr:visible");
		const countNum = $(".countNum");

		$fixed.find(".count").length === 0 ? $fixed.append("<div class='count'>Displaying <span class='countNum'>" + visibleRow.length + "</span> of " + totCount + "</div>") : false;
		return visibleRow.is(".make-selection, .no-results") ? countNum.html(0) :  $(".countNum").html(visibleRow.length);
	}
	
	/*
	|-----------------------------------------------------------
	|  Filter Items From Table
	|-----------------------------------------------------------
	*/
	
	//Checkbox Change Function	
	let $filterCheckboxes = $("#checkboxes input[type='checkbox']");
	$(".uncheck").click(function() {
		window.scrollTo(0,0);
		if ($filterCheckboxes.is(":checked")) {
			$filterCheckboxes.prop("checked", false);
			$webinar.hide();
			$noResults.hide();
			$makeSelection.fadeIn(500);
		}
		else {
			$filterCheckboxes.prop("checked", true);
			$webinar.fadeIn(500);
			$table.trigger('applyWidgets');
			$makeSelection.hide();
		}
		addCounter().delay(50);
	});

	$filterCheckboxes.on('change', function() {
		window.scrollTo(0,0);
		// loop through checkboxes to see if one is checked
		let $checkedLength = $("#checkboxes input[type='checkbox']:checked").length;
		$filterCheckboxes.each(function(_) {
			if ($checkedLength > 0) {
				let selectedFilters = {};
				$makeSelection.hide();

				$filterCheckboxes.filter(':checked').each(function() {
					if (!selectedFilters.hasOwnProperty(this.name)) {
						selectedFilters[this.name] = [];
					}
					selectedFilters[this.name].push(this.value);
				});
				
				// create a collection containing all of the filterable elements
				let $filteredResults = $webinar;

				// loop over the selected filter name -> (array) values pairs
				$.each(selectedFilters, function(name, filterValues) {
					// filter each .webinar element
					$filteredResults = $filteredResults.filter(function() {
						let matched = false,
							currentFilterValues = $(this).data('category').split(' ');


						// loop over each category value in the current .webinar's data-category
						$.each(currentFilterValues, function(_, currentFilterValue) {
							
							// if the current category exists in the selected filters array
							// set matched to true, and stop looping. as we're ORing in each
							// set of filters, we only need to match once

							if ($.inArray(currentFilterValue, filterValues) !== -1) {
								matched = true;
								return false;
							}
						});

						// if matched is true the current .webinar element is returned
						return matched;
					});
				});

				$webinar.hide().filter($filteredResults).fadeIn(300);
				addCounter().delay(500);
				$table.trigger('applyWidgets');
				$(".webinar:visible").length === 0 ? $noResults.fadeIn(500) : $noResults.hide();
				return false;
			}
			else {
				$webinar.hide();
				$makeSelection.fadeIn(500);
			}
		});
	});

	//Initial Running functions
	checkDefault();
	rowClick();
	//!!	addCounter() should always be called last	!!
	addCounter();
	//!!	Table Sort should always be after headers have been called	!!
	$table.tablesorter({
			sortList: [[3,1], [0,0]],
			widgets: ["zebra"],
			widgetOptions: {
				zebra : ['stripe', 'nostripe']
			}
		});
});