dist/tabselect.zip: $(shell find . -name dist -prune -o -print)
	zip $@ $^ -x Makefile

icons: icons/tabselect-16.png icons/tabselect-24.png icons/tabselect-32.png icons/tabselect-48.png icons/tabselect-96.png icons/tabselect-128.png

icons/tabselect-%.png: icons/tabselect.svg Makefile
	convert -background none $< -size $*x$* $@

