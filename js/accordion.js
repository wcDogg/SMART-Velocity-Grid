/*!
 * Va11y Velocity V2 Accordion
 * @file /js/c-accordion.js
 *
 * @credit AriaAccordion
 * @author Frédéric Bisson <zigazou@free.fr>
 * @version 1.0
 * @licence MIT
 * @URL https://www.cssscript.com/accessible-accordion-ariaaccordion/
 *
 * @credit `getHeight()`
 * @author Chris Ferdinandi
 * @licence MIT
 * @URL https://gomakethings.com/how-to-add-transition-animations-to-vanilla-javascript-show-and-hide-methods/
 *
 * @credit Velocity V2
 * @author
 * @licence
 * @URL
 *
 */

console.log('LOADED accordion.js');

/**
 * The AriaAccordionOptions holds all the options used by the AriaAccordion
 * class.
 *
 * @typedef {Object} AriaAccordionOptions
 * @property {string} headersSelector CSS selector used to identify headers.
 * @property {string} panelsSelector CSS selector used to identify panels.
 * @property {string} buttonsSelector CSS selector used to identify buttons.
 * @property {HTMLButtonElement} button The button that will be cloned to open
 *                                      or close a panel.
 * @property {string} buttonSuffixId Suffix of button ID.
 * @property {boolean} multiselectable Indicates if the accordion is
 *                                     multiselectable
 * @property {string} prefixClass Prefix of CSS accordion class.
 * @property {string} headerSuffixClass Suffix of CSS header class.
 * @property {string} buttonSuffixClass Suffix of CSS button class.
 * @property {string} direction "ltr" for left to right,
 *                              "rtl" for right to left.
 * @property {string} accordionPrefixId Accordion prefix ID.
 */

/**
 * Accessible Accordion system, using ARIA
 * Based on: https://a11y.nicolas-hoffmann.net/accordion/
 */
class AriaAccordion {
    /**
     * Create an AriaAccordion.
     * @param {HTMLElement} container The container element.
     * @param {AriaAccordionOptions?} options The options.
     */
    constructor(container, options) {
        /**
         * An attribute containing every option.
         * @member {Object}
         * @private
         */
        this.options = Object.assign(
            {},
            AriaAccordion.defaultConfig,
            options || {}
        )

        /**
         * The HTMLElement containing all the elements of the accordion.
         * @member {HTMLElement}
         * @private
         */
        this.root = container

        /**
         * The panels of our accordion.
         * @member {HTMLElement[]}
         * @private
         */
        this.panels = Array.from(
            this.root.querySelectorAll(this.options.panelsSelector)
        )

        this.initAttributes()
        this.initEvents()

        /**
         * The buttons that will open or close the panels.
         * @member {HTMLElement[]}
         * @private
         */
        this.buttons = Array.from(
            this.root.querySelectorAll(this.options.buttonsSelector)
        )
    }

    /**
     * Initializes attributes and classes of the accordion elements.
     */
    initAttributes() {
        this.root.setAttribute('role', 'presentation')
        this.root.setAttribute(
            'aria-multiselectable',
            this.options.multiselectable
        )
        this.root.classList.add(this.options.prefixClass)

        // id generated if not present
        if(!this.root.id) {
            const readableIndex = Math.random().toString(32).slice(2, 12)
            this.root.id = this.options.accordionPrefixId + '-' + readableIndex
        }

        this.panels.forEach((panel, index) => {
            const header = panel.querySelector(this.options.headersSelector)

            const button = this.options.button.cloneNode()
            while(header.firstChild) {
                button.appendChild(header.firstChild)
            }
            header.appendChild(button)

            this.root.insertBefore(header, panel)

            const panelId = (panel.id || this.root.id) + '-' + index
            const buttonId = panelId + this.options.buttonSuffixId

            button.id = buttonId
            button.setAttribute('aria-controls', panelId)
            button.setAttribute('aria-expanded', 'false')
            button.setAttribute('aria-selected', 'false')

            panel.id = panelId
            panel.setAttribute('aria-labelledby', buttonId)
            panel.setAttribute('role', 'region')
            panel.setAttribute('aria-hidden', 'true')

            // if opened by default
            if(panel.dataset.accordionOpen === 'true') {
                button.setAttribute('aria-expanded', 'true')
                button.dataset.accordionOpen = null
                panel.setAttribute('aria-hidden', 'false')
            }
        })
    }

    /**
     * Install events on the accordion elements.
     */
    initEvents() {
        this.root.querySelectorAll(this.options.buttonsSelector).forEach(
            button => {
                button.addEventListener(
                    'focus',
                    event => this.focusButtonEventHandler(event)
                )

                button.addEventListener(
                    'click',
                    event => this.clickButtonEventHandler(event)
                )

                button.addEventListener(
                    'keydown',
                    event => this.keydownButtonEventHandler(event)
                )
            }
        )
    }

    /**
     * Handles button focus event.
     *
     * @param {Event} event The event information.
     * @private
     */
    focusButtonEventHandler(event) {
        const target = event.target
        const currentButton = AriaAccordion.closest(target, 'button')

        this.root.querySelectorAll(this.options.buttonsSelector).forEach(
            button => button.setAttribute('aria-selected', 'false')
        )

        currentButton.setAttribute('aria-selected', 'true')
    }

    /**
     * Handles button click event.
     *
     * @param {Event} event The event information.
     * @private
     */
    clickButtonEventHandler(event) {
        const currentButton = AriaAccordion.closest(event.target, 'button')
        const currentPanel = document.getElementById(
            currentButton.getAttribute('aria-controls')
        )

        this.buttons.forEach(
            button => button.setAttribute('aria-selected', 'false')
        )

        currentButton.setAttribute('aria-selected', 'true')

    // START Customizations
        // Get panel height
        var panelInfo = function () {
            // Temp unhide so we can get info
            currentPanel.setAttribute('aria-hidden', 'false')
            // Grab the info
            var isHeight = currentPanel.scrollHeight + 'px'
            // Re-hide panel
            currentPanel.setAttribute('aria-hidden', 'true')
            // Return info  
            return isHeight       
        }

        // Store panel height as variable so we can use it below
        var panelHeight = panelInfo() 

        // if closed
        if(currentButton.getAttribute('aria-expanded') === 'false') {
            // Add Velocity animation
            // Note `forcefed` is best way to approach transforms
            // TODO Move `transform-origin` from CSS to here
            currentPanel.velocity({ 
                height: [ panelHeight, 0 ],
                transform: [ "scaleY(1)", "scaleY(0)" ],
                opacity: [ 1, 0 ],  
            }, { duration: 400 })
            // Switch classes
            currentButton.setAttribute('aria-expanded', 'true')
            currentPanel.setAttribute('aria-hidden', 'false')  
        // if opened
        } else {
            // Add Velocity animation
            currentPanel.velocity({ 
                opacity: [ 0, 1 ], 
                transform: [ "scaleY(0)", "scaleY(1)" ],               
                height: [ 0, panelHeight ], 
            }, { duration: 400 })
            // Switch classes
            currentButton.setAttribute('aria-expanded', 'false')
            currentPanel.setAttribute('aria-hidden', 'true')    
        }
        // END Customizations

        if(this.options.multiselectable === false) {
            this.panels.forEach(panel => {
                if(currentPanel !== panel) {
                    panel.setAttribute('aria-hidden', 'true')
                }
            })

            this.buttons.forEach(button => {
                if(currentButton !== button) {
                    button.setAttribute('aria-expanded', 'false')
                }
            })
        }

        setTimeout(() => currentButton.focus(), 0)

        event.stopPropagation()
        event.preventDefault()
    }

    /**
     * Handles keydown event on a button.
     *
     * @param {Event} event The event information.
     * @private
     */
    keydownButtonEventHandler(event) {
        const currentButton = AriaAccordion.closest(event.target, 'button')
        let index = this.buttons.indexOf(currentButton)

        const keys = this.options.direction === 'ltr' ? AriaAccordion.ltrKeys
                                                      : AriaAccordion.rtlKeys

        if(AriaAccordion.allKeys.includes(event.keyCode) && !event.ctrlKey) {
            this.buttons.forEach(
                button => button.setAttribute('aria-selected', 'false')
            )

            if(event.keyCode === AriaAccordion.keyHome) {
                index = 0 // Home
            } else if(event.keyCode === AriaAccordion.keyEnd) {
                index = this.buttons.length - 1 // End
            } else if(keys.prev.includes(event.keyCode)) {
                index += this.buttons.length - 1 // Previous
            } else if(keys.next.includes(event.keyCode)) {
                index++ // Next
            }

            AriaAccordion.goToHeader(this.buttons[index % this.buttons.length])

            event.preventDefault()
        }
    }
}

/**
 * Focus on a specific element.
 *
 * @param {HTMLElement} target Element that will receive focus.
 */
AriaAccordion.goToHeader = function(target) {
    target.setAttribute('aria-selected', 'true')

    setTimeout(() => target.focus(), 0)
}

/**
 * Imitates the "closest" jQuery method which will go through the ancestors of
 * an element to find the one matching a selector.
 *
 * @param {HTMLElement} element Search starts from this element.
 * @param {string} selector CSS selector to match.
 * @return {HTMLelement} The element found or null.
 */
AriaAccordion.closest = function(element, selector) {
    if(element === null) return null
    if(element.matches(selector)) return element
    if(element instanceof HTMLHtmlElement) return null

    return AriaAccordion.closest(element.parentNode, selector)
}

/**
 * Key code for the End key.
 *
 * @member {int}
 */
AriaAccordion.keyEnd = 35

/**
 * Key code for the Home key.
 *
 * @member {int}
 */
AriaAccordion.keyHome = 36

/**
 * Key code for the Cursor Left key.
 *
 * @member {int}
 */
AriaAccordion.keyLeft = 37

/**
 * Key code for the Cursor Up key.
 *
 * @member {int}
 */
AriaAccordion.keyUp = 38

/**
 * Key code for the Cursor Right key.
 *
 * @member {int}
 */
AriaAccordion.keyRight = 39

/**
 * Key code for the Cursor Down key.
 *
 * @member {int}
 */
AriaAccordion.keyDown = 40

/**
 * Key codes for left to right display.
 *
 * @member {Object}
 */
AriaAccordion.ltrKeys = {
    prev: [AriaAccordion.keyUp, AriaAccordion.keyLeft],
    next: [AriaAccordion.keyDown, AriaAccordion.keyRight],
    first: AriaAccordion.keyHome,
    last: AriaAccordion.keyEnd
}

/**
 * Key codes for right to left display.
 *
 * @member {Object}
 */
AriaAccordion.rtlKeys = {
    prev: [AriaAccordion.keyUp, AriaAccordion.keyRight],
    next: [AriaAccordion.keyDown, AriaAccordion.keyLeft],
    first: AriaAccordion.keyHome,
    last: AriaAccordion.keyEnd
}

/**
 * All key codes the accordion understands.
 *
 * @member {int[]}
 */
AriaAccordion.allKeys = [].concat(
    AriaAccordion.keyUp, AriaAccordion.keyDown,
    AriaAccordion.keyLeft, AriaAccordion.keyRight,
    AriaAccordion.keyHome, AriaAccordion.keyEnd
)

/**
 * Generates a default button.
 *
 * @member {HTMLButtonElement}
 */
AriaAccordion.defaultButton = function() {
    const button = document.createElement('button')
    button.classList.add('c-accordion__btn')
    button.setAttribute('type', 'button')

    return button
}

/**
 * Default configuration options.
 *
 * @member {AriaAccordionOptions}
 */
AriaAccordion.defaultConfig = {
    headersSelector: '.c-accordion__header',
    panelsSelector: '.c-accordion__panel',
    buttonsSelector: 'button.c-accordion__btn',
    button: AriaAccordion.defaultButton(),
    buttonSuffixId: '__btn',
    multiselectable: true,
    prefixClass: 'c-accordion',
    headerSuffixClass: '__header',
    buttonSuffixClass: '__btn',
    panelSuffixClass: '__panel',
    direction: 'ltr',
    accordionPrefixId: 'c-accordion'
}

/**
 * Initializes all the accordion container given their selector.
 *
 * Each container may have the following data attributes:
 *
 * - data-accordion-multiselectable: "true" or "false"
 * - data-accordion-prefix-class: prefix classes
 *
 * @param {string} selector a CSS selector to specify every accordion container.
 * @param {AriaAccordionOptions} options Object containing all the custom
 *                                       settings.
 * @return {AriaAccordion[]} An array of AriaAccordion.
 */
AriaAccordion.init = function(selector, options) {
    const containers = Array.from(document.querySelectorAll(selector))

    return containers.map(container => {
        // Look for options given via data attributes.
        const tagOptions = {}

        // data-accordiion-multiselectable
        if(container.dataset.accordionMultiselectable === 'false') {
            tagOptions.multiselectable = false
        }

        // data-accordion-prefix-class
        if(container.dataset.accordionPrefixClass !== undefined) {
            tagOptions.prefixClass = container.dataset.accordionPrefixClass
        }

        // Try to guess the direction used in the container.
        if(AriaAccordion.closest(container, '[dir="rtl"]') !== null) {
            tagOptions.direction = 'rtl'
        }

        return new AriaAccordion(
            container,
            Object.assign({}, tagOptions, options)
        )
    })
}