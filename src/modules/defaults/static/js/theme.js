// @ts-nocheck
"use strict";
var currentTheme = localStorage.getItem("theme");
document.addEventListener("DOMContentLoaded", () => {
    const navToggler = document.getElementById("nav-toggle");
    const dbWrapper = document.getElementById("db-wrapper");

    if(navToggler && dbWrapper){
        navToggler.addEventListener('click', (e)=>{
            e.preventDefault()
            dbWrapper.classList.toggle("toggled");
        })
    }
    const toggleSwitch = document.getElementById("theme-toggle");
    if(toggleSwitch) toggleSwitch.addEventListener("click", switchTheme);
    currentTheme && (document.documentElement.setAttribute("data-theme", currentTheme));

    document.querySelectorAll(".dropdown-menu a.dropdown-toggle").forEach((function(e) {
        e.addEventListener("click", (function(e) {
            if (!this.nextElementSibling.classList.contains("show")) {
                this.closest(".dropdown-menu").querySelectorAll(".show").forEach((function(e) {
                    e.classList.remove("show")
                }
                ))
            }
            this.nextElementSibling.classList.toggle("show");
            const t = this.closest("li.nav-item.dropdown.show");
            t && t.addEventListener("hidden.bs.dropdown", (function(e) {
                document.querySelectorAll(".dropdown-submenu .show").forEach((function(e) {
                    e.classList.remove("show")
                }
                ))
            }
            )),
            e.stopPropagation()
        }
        ))
    }));
});
    

function switchTheme() {
    document.documentElement.getAttribute("data-theme") === "dark" ? document.documentElement.setAttribute("data-theme", "light") : document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", document.documentElement.getAttribute("data-theme"))
}


