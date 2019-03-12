var pagination = {
    code: '',
    extend: (data) => {
        data = data || {}
        pagination.size = data.size || 1
        pagination.page = data.page || 1
        pagination.step = data.step || 1
        pagination.query = data.query
    },
    add: (s, f) => {
        for (var i = s; i < f; i++) {
            pagination.code += `<a href=/dashboard/reports?page=${ i }${ pagination.query }>` + i + '</a>'
        }
    },
    last: () => {
        pagination.code += `<i>...</i><a href=/dashboard/reports?page=${ pagination.size }${ pagination.query }>` + pagination.size + '</a>'
    },
    first: () => {
        pagination.code += `<a href=/dashboard/reports?page=1${ pagination.query }>1</a><i>...</i>`
    },
    click: function() {
        pagination.page = +this.innerHTML
        pagination.start()
    },
    prev: () => {
        pagination.page--;
        if (pagination.page < 1) {
            pagination.page = 1
        }
        pagination.start()
    },
    next: () => {
        pagination.page++
        if (pagination.page > pagination.size) {
            pagination.page = pagination.size
        }
        pagination.start()
    },
    bind: () => {
        var a = pagination.e.getElementsByTagName('a')
        for (var i = 0; i < a.length; i++) {
            if (+a[i].innerHTML === pagination.page) a[i].className = 'active'
            a[i].addEventListener('click', pagination.click, false)
        }
    },
    finish: () => {
        pagination.e.innerHTML = pagination.code
        pagination.code = ''
        pagination.bind()
    },
    start: () => {
        if (pagination.size < pagination.step * 2 + 6) {
            pagination.add(1, pagination.size + 1)
        }
        else if (pagination.page < pagination.step * 2 + 1) {
            pagination.add(1, pagination.step * 2 + 4)
            pagination.last()
        }
        else if (pagination.page > pagination.size - pagination.step * 2) {
            pagination.first()
            pagination.add(pagination.size - pagination.step * 2 - 2, pagination.size + 1)
        }
        else {
            pagination.first()
            pagination.add(pagination.page - pagination.step, pagination.page + pagination.step + 1)
            pagination.last()
        }
        pagination.finish()
    },
    buttons: (e) => {
        var nav = e.getElementsByTagName('a');
        nav[0].addEventListener('click', pagination.prev, false)
        nav[1].addEventListener('click', pagination.next, false)
    },
    create: (e) => {
        var html = [
            `<a href=/dashboard/reports?page=${ REPORTS.currentPage - 1 }${ pagination.query }>&#9668;</a>`,
            '<span></span>',
            `<a href=/dashboard/reports?page=${ REPORTS.currentPage + 1 }${ pagination.query }>&#9658;</a>`
        ];
        e.innerHTML = html.join('')
        pagination.e = e.getElementsByTagName('span')[0]
        pagination.buttons(e)
    },
    init: (e, data) => {
        pagination.extend(data)
        pagination.create(e)
        pagination.start()
    }
}
var init = () => {
    pagination.init(document.getElementById('pagination'), {
        size: Number(REPORTS.totalPage),
        page: Number(REPORTS.currentPage),
        step: Number(REPORTS.reportPaginationStep),
        query: String(REPORTS.query) || ''
    })
}
document.addEventListener('DOMContentLoaded', init, false)
