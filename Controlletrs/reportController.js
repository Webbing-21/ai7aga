const Report = require('../Models/reportmodel');
exports.Report = async (req, res) => {
    try {
        const { name, email, PhoneNumber, Report } = req.body;
        const newReport = new ReportModel({ name, email, PhoneNumber, Report });
        await newReport.save();
        res.status(200).json({ message: 'Report information saved successfully' });
    } catch (error) {
        console.error("Error saving report information:", error);
        res.status(500).json({ message: "Something went wrong" });
    }

}
exports.RespondToReport = async (req, res) => {
    try {
        const { reportId } = req.body;
        const { message } = req.body;

        const report = await ReportModel.findById(reportId);

        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }

        const emailText = `Hello ${report.name},\n\nRegarding your report:\n"${report.Report}"\n\nAdmin Response:\n${message}`;

        await sendEmail(report.email, "Response to Your Report", emailText);

        res.status(200).json({ message: "Response sent successfully" });
        report.findByIdAndDelete(reportId)
    } catch (error) {
        console.error("Error responding to report:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};
exports.DeleteReport = async (req, res) => {
    try {
        const { reportId } = req.body;
        const report = await Report.findByIdAndDelete(reportId);
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }
        res.status(200).json({ message: "Report deleted successfully" });
    } catch (error) {
        console.error("Error deleting report:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
}
exports.SeeAllRep= async (req,res) => {
    try{
        const reports = await ReportModel.find().sort({createdAt:-1});
        res.status(200).json({reports});
    }catch(error){
        console.error("Error fetching reports:", error);
        res.status(400).json("somthing went wrong")
        
    }
    
}