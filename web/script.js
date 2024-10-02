new Vue({
    el: "#app",
    data: {
        title: "我的导航页",
        categories: [],
        sites: [],
        isModalActive: false,
        projectType: "",
        siteName: "",
        siteURL: "",
        siteCategory: "",
        categoryName: "",
    },
    methods: {
        openModal() {
            this.isModalActive = true;
        },
        closeModal() {
            this.isModalActive = false;
            this.resetForm();
        },
        resetForm() {
            this.projectType = "";
            this.siteName = "";
            this.siteURL = "";
            this.siteCategory = "";
            this.categoryName = "";
        },
        async submitForm() {
            try {
                if (this.projectType === "site") {
                    await this.addSite();
                } else if (this.projectType === "category") {
                    await this.addCategory();
                }
                this.closeModal();
            } catch (error) {
                console.error("提交表单时出错:", error);
            }
        },
        async addSite() {
            try {
                const response = await fetch("/api/sites", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: this.siteName,
                        url: this.siteURL,
                        category_id: parseInt(this.siteCategory),
                    }),
                });
                if (!response.ok) throw new Error("网络响应不正常");
                const data = await response.json();
                this.sites.push(data);
            } catch (error) {
                console.error("添加网站时出错:", error);
                alert("添加网站时出错，请重试。");
            }
        },
        async addCategory() {
            try {
                const response = await fetch("/api/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: this.categoryName }),
                });
                if (!response.ok) throw new Error("网络响应不正常");
                const data = await response.json();
                this.categories.push(data);
            } catch (error) {
                console.error("添加分类时出错:", error);
                alert("添加分类时出错，请重试。");
            }
        },
        async moveCategory(id, direction) {
            const index = this.categories.findIndex(cat => cat.ID === id);
            const newIndex = index + direction;

            if (newIndex >= 0 && newIndex < this.categories.length) {
                const newOrder = newIndex + 1;
                try {
                    const response = await fetch("/api/categories", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id, order: newOrder }),
                    });
                    if (!response.ok) throw new Error("网络响应不正常");
                    // Update local order
                    const category = this.categories.splice(index, 1)[0];
                    this.categories.splice(newIndex, 0, category);
                } catch (error) {
                    console.error("更新分类顺序时出错:", error);
                    alert("更新分类顺序时出错，请重试。");
                }
            }
        },
        sitesInCategory(categoryId) {
            return this.sites.filter(site => site.category_id === categoryId);
        },
        openSite(url) {
            window.open(url, "_blank");
        },
    },
    async mounted() {
        try {
            const [categoriesResponse, sitesResponse] = await Promise.all([
                fetch("/api/categories"),
                fetch("/api/sites"),
            ]);

            if (!categoriesResponse.ok || !sitesResponse.ok) {
                throw new Error("网络响应不正常");
            }

            const categoriesData = await categoriesResponse.json();
            const sitesData = await sitesResponse.json();

            console.log("Categories:", categoriesData);
            console.log("Sites:", sitesData);

            this.categories = categoriesData || [];
            this.sites = sitesData || [];
        } catch (error) {
            console.error("加载数据时出错:", error);
            alert("加载数据时出错，请刷新页面重试。");
            this.categories = [];
            this.sites = [];
        }
    },
});